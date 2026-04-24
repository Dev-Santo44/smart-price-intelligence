"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function MarketDistribution() {
  const { selectedProducts } = useAnalytics();
  const { data, isLoading } = useAnalyticsData<any>({ section: "distribution", params: { productId: selectedProducts[0] } });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-64 animate-pulse" />;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-xs">
        <div className="font-semibold">{d.price_range}</div>
        <div className="text-slate-500">{d.count} competitor(s)</div>
        {d.is_your_price && <div className="text-blue-600 font-bold">← Your Price</div>}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wide">Data</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Market Price Distribution</h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400">Your Percentile</div>
          <div className="text-lg font-bold text-blue-600">{data.your_percentile}th</div>
        </div>
      </div>
      <div className="h-48 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.buckets}>
            <XAxis dataKey="price_range" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={1} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={data.buckets?.findIndex((b: any) => b.is_your_price)} stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" label={{ value: "You", position: "top", fontSize: 10, fill: "#3b82f6" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.buckets?.map((entry: any, i: number) => (
                <Cell key={i} fill={entry.is_your_price ? "#3b82f6" : "#94a3b8"} fillOpacity={entry.is_your_price ? 1 : 0.5} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
        <span>Market Median: ₹{data.market_median?.toLocaleString()}</span>
        <span>Your Price: ₹{data.your_price?.toLocaleString()}</span>
      </div>
    </div>
  );
}
