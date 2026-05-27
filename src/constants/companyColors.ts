import type { CompanyColor } from "../types";

export const COMPANY_COLORS: Record<string, CompanyColor> = {
  Apple:     { bg: "#e8e8ed", text: "#1d1d1f" },
  Meta:      { bg: "#0082FB", text: "#ffffff" },
  Google:    { bg: "#4285F4", text: "#ffffff" },
  Amazon:    { bg: "#FF9900", text: "#000000" },
  Netflix:   { bg: "#E50914", text: "#ffffff" },
  Spotify:   { bg: "#1DB954", text: "#000000" },
  Figma:     { bg: "#F24E1E", text: "#ffffff" },
  Stripe:    { bg: "#6772E5", text: "#ffffff" },
  Linear:    { bg: "#5E6AD2", text: "#ffffff" },
  Vercel:    { bg: "#f0f0f0", text: "#000000" },
  OpenAI:    { bg: "#10a37f", text: "#ffffff" },
  Microsoft: { bg: "#00A4EF", text: "#ffffff" },
  Adobe:     { bg: "#FF0000", text: "#ffffff" },
  Dropbox:   { bg: "#0061FF", text: "#ffffff" },
  Atlassian: { bg: "#0052CC", text: "#ffffff" },
  Notion:    { bg: "#3d3d3d", text: "#ffffff" },
  Shopify:   { bg: "#96BF48", text: "#000000" },
  Uber:      { bg: "#2d2d2d", text: "#ffffff" },
};

export const DEFAULT_COLOR: CompanyColor = { bg: "#333333", text: "#ffffff" };

export function getCompanyColor(company: string): CompanyColor {
  const normalized = company.trim().replace(/\s+/g, " ");
  return COMPANY_COLORS[normalized] ?? DEFAULT_COLOR;
}
