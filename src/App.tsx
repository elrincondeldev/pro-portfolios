import { useState, useCallback } from "react";
import { usePortfolios } from "./hooks/usePortfolios";
import { CompanyNav } from "./components/CompanyNav";
import { DesignerGrid } from "./components/DesignerGrid";
import { PortfolioModal } from "./components/PortfolioModal";
import type { Portfolio } from "./types";
import Footer from "./components/Footer";

export default function App() {
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [openPortfolio, setOpenPortfolio] = useState<Portfolio | null>(null);

  const { portfolios, companies, total } = usePortfolios(selectedCompany);

  const handleOpen = useCallback((portfolio: Portfolio) => {
    setOpenPortfolio(portfolio);
  }, []);

  const handleClose = useCallback(() => {
    setOpenPortfolio(null);
  }, []);

  const handleCompanySelect = useCallback((company: string) => {
    setSelectedCompany(company);
    setOpenPortfolio(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#111]">
      <header className="px-4 md:px-8 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111]">
          Top Portfolios
        </h1>
        <p className="text-[#999] text-sm mt-1.5">
          Discover {total} portfolios at top tech companies.
        </p>
      </header>

      <div className="sticky top-0 bg-[#f7f7f7]/90 backdrop-blur-sm py-3 z-10 mb-8">
        <CompanyNav
          companies={companies}
          total={total}
          selected={selectedCompany}
          onSelect={handleCompanySelect}
        />
      </div>

      <DesignerGrid portfolios={portfolios} onOpen={handleOpen} />

      <Footer />

      <PortfolioModal portfolio={openPortfolio} onClose={handleClose} />
    </div>
  );
}
