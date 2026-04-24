"use client";
import React from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function DataFreshness() {
  const { data, isLoading, refetch } = useAnalyticsData<any[]>({ section: "data-freshness" });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-48 animate-pulse" />;

  const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    green: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "Fresh" },
    amber: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", label: "Stale" },
    red: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30", label: "Failed" },
  };

  const formatAge = (iso: string) => {
    const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
    if (hours < 1) return "< 1h ago";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wide">Alert</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Data Freshness</h3>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((source: any) => {
          const config = statusConfig[source.status] || statusConfig.amber;
          const Icon = config.icon;
          return (
            <div key={source.source} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full ${config.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{source.source}</div>
                <div className="text-[10px] text-slate-400">{source.records_count} records · {formatAge(source.last_scraped)}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>{config.label}</span>
              <button onClick={() => refetch()} className="text-slate-400 hover:text-blue-600 transition-colors" title="Re-scrape">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
