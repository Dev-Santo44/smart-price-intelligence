"use client";
import React from "react";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function SegmentTable() {
  const { data, isLoading } = useAnalyticsData<any[]>({ section: "segments" });

  if (isLoading || !data) return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-48 animate-pulse" />;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="mb-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-wide">ML</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Segment-Level Recommendations</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <th className="pb-2 pr-2 font-medium">Segment</th>
              <th className="pb-2 px-2 font-medium">Region</th>
              <th className="pb-2 px-2 font-medium">Current</th>
              <th className="pb-2 px-2 font-medium">Recommended</th>
              <th className="pb-2 px-2 font-medium">Delta</th>
              <th className="pb-2 px-2 font-medium">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {data.map((seg: any, i: number) => (
              <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-2 pr-2 font-medium text-slate-700 dark:text-slate-300">{seg.segment}</td>
                <td className="py-2 px-2 text-slate-500">{seg.region}</td>
                <td className="py-2 px-2 text-slate-600 dark:text-slate-400">₹{seg.current?.toLocaleString()}</td>
                <td className="py-2 px-2 font-semibold text-indigo-600">₹{seg.recommended?.toLocaleString()}</td>
                <td className={`py-2 px-2 font-semibold ${seg.delta?.startsWith("+") ? "text-emerald-600" : "text-rose-500"}`}>{seg.delta}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${seg.confidence * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400">{Math.round(seg.confidence * 100)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
