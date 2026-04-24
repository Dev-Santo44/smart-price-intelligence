"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function ModelAccuracy() {
  const { data, isLoading } = useAnalyticsData<any>({ section: "model-accuracy" });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-48 animate-pulse" />;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-wide">ML</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Model Accuracy</h3>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Avg MAPE</div>
            <div className="text-lg font-bold text-amber-600">{data.avg_mape}%</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Hit Rate</div>
            <div className="text-lg font-bold text-emerald-600">{data.avg_hit_rate}%</div>
          </div>
        </div>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.months}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip formatter={(val: any, name: string) => [`${val}%`, name === "hit_rate" ? "Hit Rate" : "MAPE"]}
              contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Line type="monotone" dataKey="hit_rate" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Hit Rate" />
            <Line type="monotone" dataKey="mape" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="MAPE" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
