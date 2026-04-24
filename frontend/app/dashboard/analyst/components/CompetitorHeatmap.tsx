"use client";
import React, { useState } from "react";
import { ArrowUpDown, Download } from "lucide-react";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function CompetitorHeatmap() {
  const { data, isLoading } = useAnalyticsData<any[]>({ section: "heatmap" });
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-64 animate-pulse" />;

  const productIds = Object.keys(data[0] || {}).filter(k => k.startsWith("P-"));
  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey]?.price || 0;
    const bVal = b[sortKey]?.price || 0;
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const exportCSV = () => {
    const headers = ["Competitor", ...productIds.map(id => data[0]?.[id]?.product_name || id)];
    const rows = sorted.map(row => [row.competitor, ...productIds.map(id => row[id]?.price || "")]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "competitor_heatmap.csv"; a.click();
  };

  const getCellColor = (delta: number) => {
    if (delta > 10) return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400";
    if (delta > 5) return "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400";
    if (delta > 0) return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400";
    if (delta > -5) return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400";
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wide">Data</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Competitor Price Heatmap</h3>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
          <Download className="w-3 h-3" /> CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <th className="pb-2 pr-4 font-medium">Competitor</th>
              {productIds.map(id => (
                <th key={id} className="pb-2 px-2 font-medium cursor-pointer hover:text-blue-600" onClick={() => toggleSort(id)}>
                  <span className="flex items-center gap-1">{data[0]?.[id]?.product_name?.split(" ")[0] || id} <ArrowUpDown className="w-2.5 h-2.5" /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr key={row.competitor} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-2 pr-4 font-medium text-slate-700 dark:text-slate-300">{row.competitor}</td>
                {productIds.map(id => {
                  const cell = row[id];
                  return (
                    <td key={id} className={`py-2 px-2 rounded ${getCellColor(cell?.delta_pct || 0)}`}>
                      <div className="font-semibold">₹{cell?.price?.toLocaleString()}</div>
                      <div className="text-[10px] opacity-75">{cell?.delta_pct > 0 ? "+" : ""}{cell?.delta_pct}%</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
