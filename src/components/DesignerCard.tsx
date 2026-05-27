import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { Portfolio } from "../types";
import { getScreenshotUrl } from "../hooks/usePortfolios";
import { FallbackAvatar } from "./FallbackAvatar";
import { getCompanyColor } from "../constants/companyColors";

interface DesignerCardProps {
  portfolio: Portfolio;
  index: number;
  onOpen: (portfolio: Portfolio) => void;
}

export function DesignerCard({ portfolio, index, onOpen }: DesignerCardProps) {
  const [imgError, setImgError] = useState(false);

  const screenshotUrl = !imgError ? getScreenshotUrl(portfolio) : null;
  const color = getCompanyColor(portfolio.company);
  const staggerDelay = Math.min(index * 0.04, 0.44);

  const handleClick = useCallback(() => {
    onOpen(portfolio);
  }, [portfolio, onOpen]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: staggerDelay }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
      role="article"
      aria-label={`${portfolio.owner_name}, ${portfolio.owner_role} at ${portfolio.company}`}
      className="rounded-2xl overflow-hidden bg-white cursor-pointer select-none"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
      onClick={handleClick}
    >
      {/* Screenshot / Fallback */}
      <div className="aspect-[4/3] bg-[#f0f0f0] overflow-hidden relative">
        {screenshotUrl ? (
          <img
            src={screenshotUrl}
            alt={`${portfolio.owner_name}'s portfolio screenshot`}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <FallbackAvatar
            name={portfolio.owner_name}
            company={portfolio.company}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Info */}
      <div className="px-3 pb-3 pt-2.5">
        <p className="text-[#111] text-sm font-semibold leading-tight truncate">
          {portfolio.owner_name}
        </p>
        <p className="text-[#888] text-xs mt-0.5 leading-tight line-clamp-1">
          {portfolio.owner_role}
        </p>
        <span
          className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${color.bg}22`, color: color.bg === "#e8e8ed" ? "#555" : color.bg }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.bg === "#e8e8ed" ? "#555" : color.bg }} />
          {portfolio.company}
        </span>
      </div>
    </motion.div>
  );
}
