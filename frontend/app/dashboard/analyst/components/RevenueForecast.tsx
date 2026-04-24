"use client";
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function RevenueForecast() {
  const [volume, setVolume] = useState(100);
  const current = 2400;
  const recommended = 2580;
  const [custom, setCustom] = useState(2500);

  const data = [
    { label: "Current", price: current, revenue: current * volume, margin: ((current - current * 0.6) / current * 100), color: "#94a3b8" },
    { label: "Recommended", price: recommended, revenue: recommended * Math.round(volume * 0.95), margin: ((recommended - current * 0.6) / recommended * 100), color: "#6366f1" },
    { label: "Custom", price: custom, revenue: custom * Math.round(volume * (custom > current ? 0.9 : 1.05)), margin: ((custom - current * 0.6) / custom * 100), color: "#3b82f6" },
  ];

  const uplift = data[1].revenue - data[0].revenue;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="mb-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wide">Plan</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Revenue Forecast</h3>
      </div>
      <div className="flex gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-slate-400">Volume/mo</label>
          <input type="range" min={10} max={500} value={volume} onChange={e => setVolume(Number(e.target.value))}
            className="w-20 h-1.5 accent-blue-600" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8">{volume}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-slate-400">Custom ₹</label>
          <input type="number" value={custom} onChange={e => setCustom(Number(e.target.value))}
            className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {data.map(d => (
          <div key={d.label} className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="text-[10px] text-slate-400 uppercase">{d.label}</div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">₹{d.revenue.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400">@ ₹{d.price} × {Math.round(d.revenue / d.price)}</div>
            <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">{d.margin.toFixed(1)}% margin</div>
          </div>
        ))}
      </div>
      <div className={`text-center text-xs font-semibold py-1 rounded ${uplift >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-rose-50 dark:bg-rose-900/20 text-rose-500"}`}>
        Recommended uplift: {uplift >= 0 ? "+" : ""}₹{uplift.toLocaleString()}/mo
      </div>
    </div>
  );
}
