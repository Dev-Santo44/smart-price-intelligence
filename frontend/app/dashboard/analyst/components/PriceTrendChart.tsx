"use client";
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Brush } from "recharts";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"];

export default function PriceTrendChart() {
  const { dateRange } = useAnalytics();
  const days = Math.round((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / 86400000) || 90;
  const { data, isLoading } = useAnalyticsData<any[]>({ section: "trend", params: { days } });
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({});

  if (isLoading || !data || data.length === 0) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-72 animate-pulse" />;

  const lineKeys = Object.keys(data[0] || {}).filter(k => k !== "date");
  const toggleLine = (key: string) => setVisibleLines(prev => ({ ...prev, [key]: prev[key] === false ? true : prev[key] === undefined ? false : !prev[key] }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-xs">
        <div className="font-semibold mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-600 dark:text-slate-300">{p.dataKey}: ₹{Math.round(p.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wide">Historical</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Price Trend</h3>
        </div>
        <div className="flex flex-wrap gap-1">
          {lineKeys.map((key, i) => (
            <button key={key} onClick={() => toggleLine(key)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${visibleLines[key] === false ? "opacity-40 border-slate-200 dark:border-slate-700" : "border-slate-300 dark:border-slate-600"}`}
              style={{ color: COLORS[i % COLORS.length] }}>
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
            <Tooltip content={<CustomTooltip />} />
            {lineKeys.map((key, i) => visibleLines[key] !== false && (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={key === "your_price" ? 2.5 : 1.5} dot={false} />
            ))}
            <Brush dataKey="date" height={20} stroke="#94a3b8" fill="#f8fafc" travellerWidth={8} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
