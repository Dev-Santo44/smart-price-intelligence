"use client";
import React, { useEffect, useState } from "react";
import { Search, Filter, Calendar, ChevronDown } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";

export default function CommandBar() {
  const { selectedProducts, setSelectedProducts, selectedCompetitors, setSelectedCompetitors, dateRange, setDateRange } = useAnalytics();
  const [products, setProducts] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showCompDropdown, setShowCompDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/analytics?section=products").then(r => r.json()).then(setProducts).catch(() => {});
    fetch("/api/analytics?section=competitors").then(r => r.json()).then(d => { setCompetitors(d); setSelectedCompetitors(d.map((c: any) => c.id || c.name)); }).catch(() => {});
  }, []);

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.product_id?.toLowerCase().includes(searchQuery.toLowerCase()));
  const presets = [
    { label: "30d", days: 30 },
    { label: "90d", days: 90 },
    { label: "1y", days: 365 },
  ];

  const toggleProduct = (id: string) => {
    setSelectedProducts(selectedProducts.includes(id) ? selectedProducts.filter(x => x !== id) : [...selectedProducts, id]);
  };
  const toggleCompetitor = (id: string) => {
    setSelectedCompetitors(selectedCompetitors.includes(id) ? selectedCompetitors.filter(x => x !== id) : [...selectedCompetitors, id]);
  };
  const setPreset = (days: number, label: string) => {
    setDateRange({ from: new Date(Date.now() - days * 86400000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10), preset: label });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {/* Product Selector */}
      <div className="relative">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Input</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Product / SKU</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowProductDropdown(true); }}
              onFocus={() => setShowProductDropdown(true)}
              placeholder="Search products..."
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {showProductDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                {filteredProducts.map(p => (
                  <label key={p.product_id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm">
                    <input type="checkbox" checked={selectedProducts.includes(p.product_id)} onChange={() => toggleProduct(p.product_id)} className="rounded" />
                    <span className="text-slate-700 dark:text-slate-300">{p.name}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">{p.product_id}</span>
                  </label>
                ))}
                {filteredProducts.length === 0 && <div className="px-3 py-2 text-xs text-slate-400">No products found</div>}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedProducts.map(id => {
              const p = products.find(x => x.product_id === id);
              return (
                <span key={id} className="text-[10px] px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center gap-1">
                  {p?.name || id}
                  <button onClick={() => toggleProduct(id)} className="hover:text-rose-800">×</button>
                </span>
              );
            })}
          </div>
        </div>
        {showProductDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowProductDropdown(false)} />}
      </div>

      {/* Competitor Scope */}
      <div className="relative">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Input</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Competitor Scope</span>
          </div>
          <button onClick={() => setShowCompDropdown(!showCompDropdown)} className="w-full text-left text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">{selectedCompetitors.length} of {competitors.length} selected</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {showCompDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 mx-3">
              {competitors.map((c: any) => (
                <label key={c.id || c.name} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm">
                  <input type="checkbox" checked={selectedCompetitors.includes(c.id || c.name)} onChange={() => toggleCompetitor(c.id || c.name)} className="rounded" />
                  <span className="text-slate-700 dark:text-slate-300">{c.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {showCompDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowCompDropdown(false)} />}
      </div>

      {/* Date Range */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Input</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Date Range</span>
        </div>
        <div className="flex gap-1.5 mb-2">
          {presets.map(p => (
            <button key={p.label} onClick={() => setPreset(p.days, p.label)}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors ${dateRange.preset === p.label ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value, preset: "custom" })}
            className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-1" />
          <span className="text-xs text-slate-400">→</span>
          <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value, preset: "custom" })}
            className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-1" />
        </div>
      </div>
    </div>
  );
}
