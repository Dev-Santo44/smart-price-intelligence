"use client";
import React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function ElasticityChart() {
  const { data, isLoading } = useAnalyticsData<any>({ section: "elasticity" });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-64 animate-pulse" />;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-xs">
        <div className="font-semibold">{d.period}</div>
        <div className="text-slate-500">Price Δ: {d.price_change_pct > 0 ? "+" : ""}{d.price_change_pct}%</div>
        <div className="text-slate-500">Volume Δ: {d.volume_change_pct > 0 ? "+" : ""}{d.volume_change_pct}%</div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wide">Historical</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Price Elasticity</h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400">Elasticity Coeff.</div>
          <div className="text-sm font-bold text-indigo-600">{data.elasticity_coefficient}</div>
          <div className="text-[10px] text-slate-400">R² = {data.r_squared}</div>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="price_change_pct" type="number" name="Price Δ%" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
              label={{ value: "Price Change %", position: "bottom", fontSize: 10, fill: "#94a3b8" }} />
            <YAxis dataKey="volume_change_pct" type="number" name="Volume Δ%" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
              label={{ value: "Volume Change %", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Scatter data={data.points} fill="#6366f1" fillOpacity={0.7} r={5} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
