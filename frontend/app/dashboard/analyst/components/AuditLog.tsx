"use client";
import React from "react";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function AuditLog() {
  const { data, isLoading } = useAnalyticsData<any[]>({ section: "audit-log" });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-56 animate-pulse" />;

  const outcomeColors: Record<string, string> = {
    Positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    Negative: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wide">Historical</span>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-3">Price Change Audit Log</h3>
      <div className="overflow-x-auto max-h-52 overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-white dark:bg-slate-900">
            <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <th className="pb-2 pr-2 font-medium">Date</th>
              <th className="pb-2 px-2 font-medium">User</th>
              <th className="pb-2 px-2 font-medium">Product</th>
              <th className="pb-2 px-2 font-medium">Old → New</th>
              <th className="pb-2 px-2 font-medium">Rationale</th>
              <th className="pb-2 px-2 font-medium">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {data.map((log: any) => (
              <tr key={log.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-2 pr-2 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleDateString()}</td>
                <td className="py-2 px-2 text-slate-700 dark:text-slate-300 font-medium">{log.user}</td>
                <td className="py-2 px-2 text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{log.product}</td>
                <td className="py-2 px-2 whitespace-nowrap">
                  <span className="text-slate-500">₹{log.old_price?.toLocaleString()}</span>
                  <span className="text-slate-400 mx-1">→</span>
                  <span className={`font-semibold ${log.change_pct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>₹{log.new_price?.toLocaleString()}</span>
                  <span className={`ml-1 text-[10px] ${log.change_pct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>({log.change_pct > 0 ? "+" : ""}{log.change_pct}%)</span>
                </td>
                <td className="py-2 px-2 text-slate-500 truncate max-w-[150px]" title={log.rationale}>{log.rationale}</td>
                <td className="py-2 px-2"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${outcomeColors[log.outcome] || outcomeColors.Pending}`}>{log.outcome}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
