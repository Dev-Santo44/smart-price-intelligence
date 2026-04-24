"use client";
import React from "react";
import { Bot, ArrowUp, Shield, Lightbulb } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function RecommendationCard() {
  const { selectedProducts } = useAnalytics();
  const { data, isLoading } = useAnalyticsData<any>({ section: "recommendation", params: { productId: selectedProducts[0] } });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-64 animate-pulse" />;

  const confPct = Math.round(data.confidence * 100);
  const confColor = confPct > 85 ? "bg-emerald-500" : confPct > 70 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-wide">ML</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Price Recommendation</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Current</div>
          <div className="text-lg font-bold text-slate-600 dark:text-slate-300">₹{data.current_price?.toLocaleString()}</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800">
          <div className="text-[10px] text-indigo-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Bot className="w-3 h-3" /> Recommended</div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">₹{data.recommended_price?.toLocaleString()}</div>
          <div className={`text-xs font-semibold mt-1 ${data.margin_impact_pct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {data.margin_impact_pct > 0 ? "+" : ""}{data.margin_impact_pct}% margin
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Confidence</div>
          <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{confPct}%</div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${confColor} transition-all`} style={{ width: `${confPct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Shield className="w-3 h-3" /> Floor: <span className="font-semibold text-slate-700 dark:text-slate-300">₹{data.floor_price?.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <ArrowUp className="w-3 h-3" /> Ceiling: <span className="font-semibold text-slate-700 dark:text-slate-300">₹{data.ceiling_price?.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{data.rationale}</p>
        </div>
      </div>
    </div>
  );
}
