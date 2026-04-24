"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function FeatureImportanceChart() {
  const { data, isLoading } = useAnalyticsData<any[]>({ section: "feature-importance" });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-64 animate-pulse" />;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-xs">
        <div className="font-semibold">{payload[0].payload.feature}</div>
        <div className="text-indigo-600">Impact: {(payload[0].value * 100).toFixed(0)}%</div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="mb-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-wide">ML</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Feature Importance</h3>
        <p className="text-[10px] text-slate-400">What signals drove this recommendation</p>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap={8}>
            <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v * 100).toFixed(0)}%`} domain={[0, 0.4]} />
            <YAxis type="category" dataKey="feature" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((entry: any, i: number) => (
                <Cell key={i} fill={entry.color || "#6366f1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
