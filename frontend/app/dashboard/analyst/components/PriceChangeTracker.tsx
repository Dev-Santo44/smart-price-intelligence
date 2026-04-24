"use client";
import React, { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function PriceChangeTracker() {
  const [threshold, setThreshold] = useState(0);
  const { data, isLoading } = useAnalyticsData<any[]>({ section: "price-changes", params: { limit: 15, threshold } });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-64 animate-pulse" />;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wide">Data</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Price Change Tracker</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Min Δ%</span>
          <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} min={0} max={50} step={1}
            className="w-14 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
        </div>
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {data.map((change: any) => (
          <div key={change.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full ${change.change_pct >= 0 ? "bg-rose-100 dark:bg-rose-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"}`}>
              {change.change_pct >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-rose-600" /> : <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{change.competitor} — {change.product_name}</div>
              <div className="text-[10px] text-slate-400">₹{change.old_price?.toLocaleString()} → ₹{change.new_price?.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-bold ${change.change_pct >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {change.change_pct > 0 ? "+" : ""}{change.change_pct}%
              </div>
              <div className="text-[10px] text-slate-400">{new Date(change.timestamp).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
