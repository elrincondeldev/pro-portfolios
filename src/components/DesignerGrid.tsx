import { AnimatePresence } from "framer-motion";
import type { Portfolio } from "../types";
import { DesignerCard } from "./DesignerCard";

interface DesignerGridProps {
  portfolios: Portfolio[];
  onOpen: (portfolio: Portfolio) => void;
}

export function DesignerGrid({ portfolios, onOpen }: DesignerGridProps) {
  if (portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#bbb] text-sm">No portfolios found for this company.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-8 pb-16">
      <AnimatePresence mode="popLayout">
        {portfolios.map((portfolio, index) => (
          <DesignerCard
            key={`${portfolio.owner_name}-${portfolio.company}`}
            portfolio={portfolio}
            index={index}
            onOpen={onOpen}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
