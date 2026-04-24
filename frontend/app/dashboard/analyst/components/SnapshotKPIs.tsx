"use client";
import React from "react";
import { TrendingUp, TrendingDown, Bot, Target, DollarSign } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function SnapshotKPIs() {
  const { selectedProducts } = useAnalytics();
  const { data, isLoading } = useAnalyticsData<any>({ section: "kpis", params: { productId: selectedProducts[0] } });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Current Price",
      value: `₹${data.current_price?.toLocaleString()}`,
      sub: `Market Median: ₹${data.market_median?.toLocaleString()}`,
      delta: data.delta_pct,
      tag: "Data",
      tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      icon: DollarSign,
    },
    {
      label: "Recommended Price",
      value: `₹${data.recommended_price?.toLocaleString()}`,
      sub: `Confidence: ${data.confidence}%`,
      delta: null,
      tag: "ML",
      tagColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      icon: Bot,
    },
    {
      label: "Price Index vs Market",
      value: data.price_index,
      sub: data.price_index > 100 ? "Above market average" : data.price_index < 100 ? "Below market average" : "At market average",
      delta: data.price_index - 100,
      tag: "Data",
      tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      icon: Target,
    },
    {
      label: "Margin Impact",
      value: `${data.margin_impact_pct > 0 ? "+" : ""}${data.margin_impact_pct}%`,
      sub: "If recommendation adopted",
      delta: data.margin_impact_pct,
      tag: "Plan",
      tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isPositive = card.delta !== null && card.delta >= 0;
        return (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${card.tagColor}`}>{card.tag}</span>
              <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{card.label}</div>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{card.value}</span>
              {card.delta !== null && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold mb-0.5 ${isPositive ? "text-emerald-600" : "text-rose-500"}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(card.delta).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{card.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
