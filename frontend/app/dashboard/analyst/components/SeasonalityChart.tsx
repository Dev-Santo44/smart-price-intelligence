"use client";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart, Bar } from "recharts";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function SeasonalityChart() {
  const { data, isLoading } = useAnalyticsData<any[]>({ section: "seasonality" });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-56 animate-pulse" />;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-xs">
        <div className="font-semibold">{label}</div>
        <div className="text-blue-600">Avg Price: ₹{payload[0]?.value?.toLocaleString()}</div>
        <div className="text-amber-600">Demand Index: {payload[1]?.value}</div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wide">Historical</span>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-3">Seasonality Pattern</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="price" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
            <YAxis yAxisId="demand" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area yAxisId="price" type="monotone" dataKey="avg_price" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
            <Line yAxisId="demand" type="monotone" dataKey="demand_index" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
