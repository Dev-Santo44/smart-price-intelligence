"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type DateRange = { from: string; to: string; preset: string };

interface AnalyticsState {
  selectedProducts: string[];
  selectedCompetitors: string[];
  dateRange: DateRange;
  setSelectedProducts: (ids: string[]) => void;
  setSelectedCompetitors: (ids: string[]) => void;
  setDateRange: (range: DateRange) => void;
}

const defaultRange: DateRange = {
  from: new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  preset: "90d",
};

const AnalyticsContext = createContext<AnalyticsState | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with first product from database
  React.useEffect(() => {
    fetch("/api/analytics?section=products")
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          const firstId = data[0].product_id || data[0].id;
          setSelectedProducts([firstId]);
        }
        setIsInitialized(true);
      })
      .catch(err => {
        console.error("Failed to fetch initial products:", err);
        setSelectedProducts(["P-1001"]); // Minimal fallback
        setIsInitialized(true);
      });
  }, []);

  if (!isInitialized) {
    return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-slate-400">Loading Smart Price Intelligence...</div>;
  }

  return (
    <AnalyticsContext.Provider
      value={{ selectedProducts, selectedCompetitors, dateRange, setSelectedProducts, setSelectedCompetitors, setDateRange }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalytics must be used within AnalyticsProvider");
  return ctx;
}
