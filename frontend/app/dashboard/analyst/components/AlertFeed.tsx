"use client";
import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function AlertFeed() {
  const { data, isLoading } = useAnalyticsData<any[]>({ section: "alert-events" });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-48 animate-pulse" />;

  const severityConfig: Record<string, { icon: any; color: string; bg: string }> = {
    high: { icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30" },
    medium: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
    low: { icon: Info, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wide">Alert</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Active Alert Feed</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 font-bold">
          {data.filter((a: any) => !a.read).length} unread
        </span>
      </div>
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {data.map((alert: any) => {
          const config = severityConfig[alert.severity] || severityConfig.low;
          const Icon = config.icon;
          return (
            <div key={alert.id} className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 ${alert.read ? "border-slate-100 dark:border-slate-800 opacity-60" : "border-slate-200 dark:border-slate-700"}`}>
              <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${config.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.bg} ${config.color} uppercase`}>{alert.severity}</span>
                  <span className="text-[10px] text-slate-400">{alert.rule_name}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">{alert.message}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
              {!alert.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
