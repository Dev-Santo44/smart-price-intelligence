"use client";
import React from "react";
import { Check, X } from "lucide-react";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function FeaturePriceMatrix() {
  const { data, isLoading } = useAnalyticsData<any>({ section: "feature-matrix" });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-64 animate-pulse" />;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="mb-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wide">Data</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Feature-Price Matrix</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <th className="pb-2 pr-3 font-medium sticky left-0 bg-white dark:bg-slate-900">Competitor</th>
              {data.tiers?.map((tier: string) => (
                <th key={tier} colSpan={1} className="pb-2 px-2 font-medium text-center">{tier} Tier</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix?.map((row: any) => (
              <React.Fragment key={row.competitor}>
                <tr className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className={`py-2 pr-3 font-semibold sticky left-0 bg-white dark:bg-slate-900 ${row.competitor === "Your Product" ? "text-blue-600" : "text-slate-700 dark:text-slate-300"}`}>{row.competitor}</td>
                  {data.tiers?.map((tier: string) => (
                    <td key={tier} className="py-2 px-2 text-center">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">₹{row.tiers[tier]?.price?.toLocaleString()}</div>
                      <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                        {row.tiers[tier]?.features?.slice(0, 4).map((f: any) => (
                          <span key={f.name} title={f.name} className={`w-4 h-4 rounded-full flex items-center justify-center ${f.included ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                            {f.included ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <X className="w-2.5 h-2.5 text-slate-400" />}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        {data.features?.map((f: string) => (
          <span key={f} className="text-[10px] px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500">{f}</span>
        ))}
      </div>
    </div>
  );
}
