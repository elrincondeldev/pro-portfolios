import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Portfolio } from "../types";
import { getScreenshotUrl } from "../hooks/usePortfolios";
import { FallbackAvatar } from "./FallbackAvatar";
import { getCompanyColor } from "../constants/companyColors";

interface PortfolioModalProps {
  portfolio: Portfolio | null;
  onClose: () => void;
}

export function PortfolioModal({ portfolio, onClose }: PortfolioModalProps) {
  useEffect(() => {
    if (!portfolio) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [portfolio, onClose]);

  const screenshotUrl = portfolio ? getScreenshotUrl(portfolio) : null;
  const color = portfolio ? getCompanyColor(portfolio.company) : null;

  return createPortal(
    <AnimatePresence>
      {portfolio && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Centering container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          {/* Modal */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal
            aria-label={`${portfolio.owner_name}'s portfolio`}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="w-[90vw] max-w-lg bg-white rounded-3xl overflow-hidden pointer-events-auto"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1)" }}
          >
            {/* Screenshot */}
            <div className="relative h-56 bg-[#f0f0f0]">
              {screenshotUrl ? (
                <img
                  src={screenshotUrl}
                  alt={`${portfolio.owner_name}'s portfolio`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FallbackAvatar
                  name={portfolio.owner_name}
                  company={portfolio.company}
                  className="w-full h-full"
                />
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Company chip overlay */}
              <span
                className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm"
                style={{ backgroundColor: `${color?.bg}dd`, color: color?.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {portfolio.company}
              </span>
            </div>

            {/* Info */}
            <div className="px-5 pt-4 pb-5">
              <h2 className="text-[#111] font-bold text-lg leading-tight">{portfolio.owner_name}</h2>
              <p className="text-[#888] text-sm mt-1 mb-4">{portfolio.owner_role}</p>

              <a
                href={portfolio.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: color?.bg, color: color?.text }}
              >
                Visit portfolio
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
