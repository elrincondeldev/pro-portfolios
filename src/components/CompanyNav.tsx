import { motion, AnimatePresence } from "framer-motion";
import { getCompanyColor } from "../constants/companyColors";

interface CompanyNavProps {
  companies: [string, number][];
  total: number;
  selected: string;
  onSelect: (company: string) => void;
}

export function CompanyNav({ companies, total, selected, onSelect }: CompanyNavProps) {
  const allCompanies: [string, number][] = [["All", total], ...companies];

  return (
    <nav
      className="flex gap-2 overflow-x-auto pb-1 px-4 md:px-8 scrollbar-hide"
      role="tablist"
      aria-label="Filter by company"
    >
      {allCompanies.map(([company, count]) => {
        const isActive = selected === company;
        const color = getCompanyColor(company);

        return (
          <motion.button
            key={company}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(company)}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            style={
              isActive
                ? { color: color.text }
                : { color: "#555", backgroundColor: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
            }
          >
            {/* Sliding background for active pill */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    backgroundColor: color.bg,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </AnimatePresence>

            {/* Color dot for inactive pills */}
            {!isActive && company !== "All" && (
              <span
                className="relative w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color.bg }}
              />
            )}
            <span className="relative">{company}</span>
            <span
              className="relative text-xs tabular-nums"
              style={{ opacity: isActive ? 0.7 : 0.5 }}
            >
              {count}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
