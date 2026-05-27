import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Portfolio } from "../types";
import { getScreenshotUrl } from "../hooks/usePortfolios";
import { FallbackAvatar } from "./FallbackAvatar";
import { getCompanyColor } from "../constants/companyColors";

interface PreviewPosition {
  top: number;
  left: number;
}

interface PortfolioPreviewProps {
  portfolio: Portfolio | null;
  anchorRect: DOMRect | null;
  onClose: () => void;
  isTouch: boolean;
  cancelClear: () => void;
  scheduleClear: () => void;
}

const PREVIEW_W = 360;
const PREVIEW_H = 300;
const MARGIN = 12;

function computePosition(rect: DOMRect): PreviewPosition {
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  const top =
    spaceBelow >= PREVIEW_H + MARGIN
      ? rect.bottom + MARGIN
      : spaceAbove >= PREVIEW_H + MARGIN
      ? rect.top - PREVIEW_H - MARGIN
      : rect.bottom + MARGIN; // fallback below even if tight

  const left = Math.min(
    Math.max(MARGIN, rect.left),
    window.innerWidth - PREVIEW_W - MARGIN
  );

  return { top, left };
}

export function PortfolioPreview({
  portfolio,
  anchorRect,
  onClose,
  isTouch,
  cancelClear,
  scheduleClear,
}: PortfolioPreviewProps) {
  useEffect(() => {
    if (!portfolio) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [portfolio, onClose]);

  const screenshotUrl = portfolio ? getScreenshotUrl(portfolio) : null;
  const color = portfolio ? getCompanyColor(portfolio.company) : null;

  // ── Touch: bottom sheet ──────────────────────────────────────────
  if (isTouch) {
    return createPortal(
      <AnimatePresence>
        {portfolio && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-[9998]"
              onClick={onClose}
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-label="Portfolio preview"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] overflow-hidden"
              style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#ddd]" />
              </div>

              <div className="flex items-center justify-between px-5 pt-2 pb-3">
                <div>
                  <p className="text-[#111] font-semibold text-base">{portfolio.owner_name}</p>
                  <p className="text-[#888] text-sm mt-0.5">{portfolio.owner_role}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#666] hover:bg-[#e5e5e5] transition-colors"
                  aria-label="Close preview"
                >
                  ✕
                </button>
              </div>

              <div className="mx-4 mb-4 rounded-2xl overflow-hidden bg-[#f5f5f5] h-44">
                {screenshotUrl ? (
                  <img
                    src={screenshotUrl}
                    alt={`${portfolio.owner_name}'s portfolio screenshot`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FallbackAvatar name={portfolio.owner_name} company={portfolio.company} className="w-full h-full" />
                )}
              </div>

              <div className="px-4 pb-6">
                <a
                  href={portfolio.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: color?.bg, color: color?.text }}
                >
                  Visit portfolio →
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );
  }

  // ── Desktop: floating card ────────────────────────────────────────
  const pos = portfolio && anchorRect ? computePosition(anchorRect) : null;

  return createPortal(
    <AnimatePresence>
      {portfolio && pos && (
        <motion.div
          key="preview"
          role="dialog"
          aria-label="Portfolio preview"
          initial={{ opacity: 0, scale: 0.95, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 6, transition: { duration: 0.12 } }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="fixed z-[9999] bg-white rounded-2xl overflow-hidden"
          style={{
            top: pos.top,
            left: pos.left,
            width: PREVIEW_W,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
          }}
          // Key fix: keep the preview alive when mouse moves into it
          onMouseEnter={cancelClear}
          onMouseLeave={scheduleClear}
        >
          {/* Screenshot */}
          <div className="h-48 bg-[#f0f0f0]">
            {screenshotUrl ? (
              <img
                src={screenshotUrl}
                alt={`${portfolio.owner_name}'s portfolio screenshot`}
                className="w-full h-full object-cover"
              />
            ) : (
              <FallbackAvatar name={portfolio.owner_name} company={portfolio.company} className="w-full h-full" />
            )}
          </div>

          {/* Info */}
          <div className="px-4 pt-3 pb-4">
            <p className="text-[#111] font-semibold text-sm leading-tight">{portfolio.owner_name}</p>
            <p className="text-[#888] text-xs mt-0.5 mb-3">{portfolio.owner_role}</p>
            <a
              href={portfolio.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-opacity hover:opacity-85"
              style={{ backgroundColor: color?.bg, color: color?.text }}
            >
              Visit portfolio →
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
