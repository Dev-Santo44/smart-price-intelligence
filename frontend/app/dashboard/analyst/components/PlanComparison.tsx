"use client";
import React, { useState } from "react";
import { CheckCircle2, ArrowLeftRight } from "lucide-react";

const PLANS = [
  { id: "plan-a", name: "Conservative Growth", updated: "Apr 18", tiers: 3, base_price: 2400, margin: "18.5%", status: "active" },
  { id: "plan-b", name: "Market Match", updated: "Apr 15", tiers: 3, base_price: 2250, margin: "15.2%", status: "draft" },
  { id: "plan-c", name: "Premium Position", updated: "Apr 10", tiers: 4, base_price: 2800, margin: "22.1%", status: "archived" },
];

export default function PlanComparison() {
  const [selected, setSelected] = useState<string[]>(["plan-a", "plan-b"]);

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(prev => prev.filter(x => x !== id));
    else if (selected.length < 2) setSelected(prev => [...prev, id]);
  };

  const planA = PLANS.find(p => p.id === selected[0]);
  const planB = PLANS.find(p => p.id === selected[1]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="mb-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wide">Plan</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Plan Comparison</h3>
      </div>
      <div className="flex gap-1 mb-3">
        {PLANS.map(plan => (
          <button key={plan.id} onClick={() => toggle(plan.id)}
            className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold transition-colors ${selected.includes(plan.id) ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300"}`}>
            {plan.name}
          </button>
        ))}
      </div>
      {planA && planB ? (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2 pr-2 font-medium">Attribute</th>
                <th className="pb-2 px-2 font-medium">{planA.name}</th>
                <th className="pb-2 px-2 font-medium">{planB.name}</th>
                <th className="pb-2 px-2 font-medium">Diff</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: "Base Price", a: `₹${planA.base_price}`, b: `₹${planB.base_price}`, diff: planA.base_price !== planB.base_price },
                { key: "Tiers", a: planA.tiers, b: planB.tiers, diff: planA.tiers !== planB.tiers },
                { key: "Margin", a: planA.margin, b: planB.margin, diff: planA.margin !== planB.margin },
                { key: "Status", a: planA.status, b: planB.status, diff: planA.status !== planB.status },
                { key: "Updated", a: planA.updated, b: planB.updated, diff: false },
              ].map(row => (
                <tr key={row.key} className={`border-b border-slate-50 dark:border-slate-800/50 ${row.diff ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
                  <td className="py-2 pr-2 font-medium text-slate-600 dark:text-slate-400">{row.key}</td>
                  <td className="py-2 px-2 text-slate-700 dark:text-slate-300">{String(row.a)}</td>
                  <td className="py-2 px-2 text-slate-700 dark:text-slate-300">{String(row.b)}</td>
                  <td className="py-2 px-2">{row.diff && <ArrowLeftRight className="w-3 h-3 text-amber-500" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-4">Select 2 plans to compare</p>
      )}
      {planA && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Active proposal:</span>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {planA.name}</span>
        </div>
      )}
    </div>
  );
}
