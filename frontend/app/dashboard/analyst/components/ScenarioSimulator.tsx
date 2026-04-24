"use client";
import React, { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, TrendingUp, DollarSign, Target, Activity } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";

export default function ScenarioSimulator() {
  const { selectedProducts } = useAnalytics();
  const productId = selectedProducts[0] || "P-1001";
  const [basePrice] = useState(2400);
  const [proposedPrice, setProposedPrice] = useState(basePrice);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const simulate = useCallback(async (price: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, proposedPrice: price }),
      });
      if (res.ok) setResult(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    const timer = setTimeout(() => simulate(proposedPrice), 300);
    return () => clearTimeout(timer);
  }, [proposedPrice, simulate]);

  const priceDelta = ((proposedPrice - basePrice) / basePrice * 100).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-wide">ML</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Scenario Simulator</h3>
        <span className="text-[10px] text-slate-400">What-if analysis</span>
      </div>

      {/* Price Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-slate-500">Proposed Price</label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{proposedPrice.toLocaleString()}</span>
            <span className={`text-[11px] font-semibold ${Number(priceDelta) >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
              ({Number(priceDelta) > 0 ? "+" : ""}{priceDelta}%)
            </span>
          </div>
        </div>
        <input type="range" min={Math.round(basePrice * 0.7)} max={Math.round(basePrice * 1.4)} step={10} value={proposedPrice}
          onChange={e => setProposedPrice(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
          <span>₹{Math.round(basePrice * 0.7).toLocaleString()}</span>
          <span className="text-blue-500 font-semibold">Base: ₹{basePrice.toLocaleString()}</span>
          <span>₹{Math.round(basePrice * 1.4).toLocaleString()}</span>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <Target className="w-4 h-4 mx-auto text-blue-500 mb-1" />
            <div className="text-[10px] text-slate-400 uppercase">Win Probability</div>
            <div className={`text-lg font-bold ${result.win_probability > 60 ? "text-emerald-600" : result.win_probability > 40 ? "text-amber-600" : "text-rose-500"}`}>
              {result.win_probability}%
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <TrendingUp className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
            <div className="text-[10px] text-slate-400 uppercase">Margin</div>
            <div className={`text-lg font-bold ${result.estimated_margin_pct > 20 ? "text-emerald-600" : "text-amber-600"}`}>
              {result.estimated_margin_pct}%
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <DollarSign className="w-4 h-4 mx-auto text-amber-500 mb-1" />
            <div className="text-[10px] text-slate-400 uppercase">Monthly Revenue</div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">₹{result.estimated_monthly_revenue?.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <Activity className="w-4 h-4 mx-auto text-indigo-500 mb-1" />
            <div className="text-[10px] text-slate-400 uppercase">Position</div>
            <div className={`text-sm font-bold ${result.market_position === "Premium" ? "text-indigo-600" : result.market_position === "Undercut" ? "text-emerald-600" : "text-blue-600"}`}>
              {result.market_position}
            </div>
          </div>
        </div>
      )}
      {loading && <div className="text-center text-xs text-slate-400 mt-2 animate-pulse">Recalculating...</div>}
    </div>
  );
}
