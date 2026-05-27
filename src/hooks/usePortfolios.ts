import { useMemo } from "react";
import data from "../data/portfolios.json";
import type { Portfolio } from "../types";

const portfolios = data as Portfolio[];

export function usePortfolios(selectedCompany: string) {
  const companies = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of portfolios) {
      const c = p.company.trim();
      counts[c] = (counts[c] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const filtered = useMemo(() => {
    if (selectedCompany === "All") return portfolios;
    return portfolios.filter(
      (p) => p.company.trim() === selectedCompany
    );
  }, [selectedCompany]);

  return { portfolios: filtered, companies, total: portfolios.length };
}

export function getScreenshotUrl(portfolio: Portfolio): string | null {
  const img = portfolio.showcase_images[0];
  if (!img) return null;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/screenshots/")) return img;
  return null;
}
