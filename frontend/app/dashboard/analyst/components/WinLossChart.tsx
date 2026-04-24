"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function WinLossChart() {
  const { data, isLoading } = useAnalyticsData<any[]>({ section: "win-loss" });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-56 animate-pulse" />;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-xs">
        <div className="font-semibold">{d.band}</div>
        <div className="text-emerald-600">Wins: {d.wins}</div>
        <div className="text-rose-500">Losses: {d.losses}</div>
        <div className="font-bold mt-1">Win Rate: {d.win_rate}%</div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wide">Historical</span>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-3">Win/Loss by Price Band</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="band" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="wins" fill="#22c55e" radius={[3, 3, 0, 0]} name="Wins" />
            <Bar dataKey="losses" fill="#ef4444" radius={[3, 3, 0, 0]} name="Losses" opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
