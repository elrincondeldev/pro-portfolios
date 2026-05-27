/**
 * Portfolio Image Enricher + Supabase Upload
 * ES Module version
 *
 * node enrich_images.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://qffkvbpeprgxlncjxxiw.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZmt2YnBlcHJneGxuY2p4eGl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTg3NDUzNSwiZXhwIjoyMDk1NDUwNTM1fQ.zb_2kouEhGMIOYI_5VCIasEH0b7pue2WKnnvLOhwpsg";
const BUCKET_NAME = "portfolio-screenshots";

const INPUT_FILE = path.join(__dirname, "portfolios.json");
const OUTPUT_FILE = path.join(__dirname, "portfolios_enriched.json");
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");

const OG_CONCURRENCY = 6;
const SCREENSHOT_TIMEOUT = 15000;
const FETCH_TIMEOUT = 8000;

// ── Supabase ──────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
    console.log(`  ✓ Bucket created: ${BUCKET_NAME}`);
  } else {
    console.log(`  ✓ Bucket ready: ${BUCKET_NAME}`);
  }
}

async function uploadBuffer(buffer, filename, contentType) {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, buffer, { contentType, upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);
  return data.publicUrl;
}

async function uploadFromUrl(imageUrl, slug) {
  const res = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: FETCH_TIMEOUT,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const buffer = Buffer.from(res.data);
  const ct = res.headers["content-type"] || "image/jpeg";
  const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
  return uploadBuffer(buffer, `${slug}.${ext}`, ct);
}

async function uploadLocalFile(localPath, filename) {
  const buffer = fs.readFileSync(localPath);
  return uploadBuffer(buffer, filename, "image/png");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(name, company) {
  return `${name}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function fetchOgImage(url) {
  try {
    const res = await axios.get(url, {
      timeout: FETCH_TIMEOUT,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        Accept: "text/html",
      },
      maxRedirects: 5,
    });
    const $ = cheerio.load(res.data);
    return (
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[property="twitter:image"]').attr("content") ||
      null
    );
  } catch {
    return null;
  }
}

async function takeScreenshot(browser, url, localPath) {
  let page;
  try {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: SCREENSHOT_TIMEOUT });
    await sleep(1800);
    await page.screenshot({ path: localPath, fullPage: false });
    return true;
  } catch {
    return false;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

async function processBatch(items, fn, concurrency) {
  for (let i = 0; i < items.length; i += concurrency) {
    await Promise.all(items.slice(i, i + concurrency).map(fn));
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const portfolios = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
  console.log(`\n📂 Loaded ${portfolios.length} portfolios\n`);

  console.log("━━━ Supabase ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  await ensureBucket();

  // ── Phase 1: OG images ─────────────────────────────────────────────────
  console.log("\n━━━ Phase 1 — OG images ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  let ogOk = 0, ogFail = 0;

  await processBatch(portfolios, async (p) => {
    if (p.showcase_images?.[0]?.includes("supabase.co")) {
      console.log(`  ⏭  skip  ${p.owner_name.padEnd(28)} already uploaded`);
      return;
    }
    const og = await fetchOgImage(p.link);
    if (!og) {
      ogFail++;
      console.log(`  ✗      ${p.owner_name.padEnd(28)} no OG image`);
      return;
    }
    try {
      const url = await uploadFromUrl(og, slugify(p.owner_name, p.company));
      p.showcase_images = [url];
      ogOk++;
      console.log(`  ✓ OG   ${p.owner_name.padEnd(28)} uploaded`);
    } catch {
      p.showcase_images = [og];
      ogOk++;
      console.log(`  ~ OG   ${p.owner_name.padEnd(28)} kept original URL`);
    }
  }, OG_CONCURRENCY);

  console.log(`\n  OG done: ${ogOk} | No OG: ${ogFail}`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(portfolios, null, 2));

  // ── Phase 2: Playwright screenshots ────────────────────────────────────
  const needsShot = portfolios.filter((p) => !p.showcase_images?.length);

  if (needsShot.length === 0) {
    console.log("\n✅ All portfolios have images — skipping Playwright");
  } else {
    console.log(`\n━━━ Phase 2 — Screenshots (${needsShot.length}) ━━━━━━━━━━━━━━━━━━━━`);
    const browser = await chromium.launch({ headless: true });
    let ssOk = 0, ssFail = 0;

    for (const p of needsShot) {
      const slug = slugify(p.owner_name, p.company);
      const filename = `${slug}.png`;
      const localPath = path.join(SCREENSHOTS_DIR, filename);
      process.stdout.write(`  📸 ${p.owner_name.padEnd(28)} `);

      if (!fs.existsSync(localPath)) {
        const ok = await takeScreenshot(browser, p.link, localPath);
        if (!ok) { ssFail++; console.log("✗ screenshot failed"); continue; }
      }

      try {
        const url = await uploadLocalFile(localPath, filename);
        p.showcase_images = [url];
        ssOk++;
        console.log(`✓ uploaded`);
      } catch (e) {
        p.showcase_images = [`./screenshots/${filename}`];
        ssFail++;
        console.log(`✗ upload error — ${e.message}`);
      }
      await sleep(300);
    }

    await browser.close();
    console.log(`\n  Uploaded: ${ssOk} | Failed: ${ssFail}`);
  }

  // ── Final save ─────────────────────────────────────────────────────────
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(portfolios, null, 2));

  const total = portfolios.length;
  const withSupabase = portfolios.filter((p) => p.showcase_images?.[0]?.includes("supabase.co")).length;
  const withAny = portfolios.filter((p) => p.showcase_images?.length).length;

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Done!`);
  console.log(`   Total              : ${total}`);
  console.log(`   Supabase URLs      : ${withSupabase}`);
  console.log(`   With any image     : ${withAny}`);
  console.log(`   Without image      : ${total - withAny}`);
  console.log(`   Output             : ${OUTPUT_FILE}`);
  console.log(`   Bucket             : ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch(console.error);
