"use client";
import React, { useState } from "react";
import { Plus, Trash2, ShieldAlert } from "lucide-react";

const DEFAULT_RULES = [
  { id: "dr1", condition: "volume", operator: ">", value: 100, discount_pct: 5, floor_price: 2100, segment: "All", approval: false },
  { id: "dr2", condition: "deal_size", operator: ">", value: 50000, discount_pct: 8, floor_price: 2000, segment: "Enterprise", approval: true },
  { id: "dr3", condition: "segment", operator: "=", value: "SMB", discount_pct: 12, floor_price: 1800, segment: "SMB", approval: false },
];

export default function DiscountRules() {
  const [rules, setRules] = useState(DEFAULT_RULES);

  const addRule = () => {
    setRules(prev => [...prev, { id: `dr${Date.now()}`, condition: "volume", operator: ">", value: 0, discount_pct: 0, floor_price: 0, segment: "All", approval: false }]);
  };
  const removeRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id));
  const updateRule = (id: string, field: string, value: any) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wide">Plan</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Discount & Override Rules</h3>
        </div>
        <button onClick={addRule} className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
          <Plus className="w-3 h-3" /> Add Rule
        </button>
      </div>
      <div className="space-y-2">
        {rules.map(rule => (
          <div key={rule.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <div className="flex-1 flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-400">IF</span>
              <select value={rule.condition} onChange={e => updateRule(rule.id, "condition", e.target.value)}
                className="text-[11px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <option value="volume">Volume</option>
                <option value="deal_size">Deal Size</option>
                <option value="segment">Segment</option>
                <option value="rep_override">Rep Override</option>
              </select>
              <select value={rule.operator} onChange={e => updateRule(rule.id, "operator", e.target.value)}
                className="text-[11px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-12">
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="=">=</option>
              </select>
              <input value={rule.value} onChange={e => updateRule(rule.id, "value", e.target.value)}
                className="text-[11px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-20" />
              <span className="text-[10px] text-slate-400">THEN</span>
              <div className="flex items-center gap-1">
                <input type="number" value={rule.discount_pct} onChange={e => updateRule(rule.id, "discount_pct", Number(e.target.value))}
                  className="text-[11px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-14" />
                <span className="text-[10px] text-slate-400">% off</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1" title="Floor price guard">
                <ShieldAlert className="w-3 h-3 text-amber-500" />
                <input type="number" value={rule.floor_price} onChange={e => updateRule(rule.id, "floor_price", Number(e.target.value))}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 w-16" />
              </div>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={rule.approval} onChange={e => updateRule(rule.id, "approval", e.target.checked)} className="rounded text-blue-600" />
                <span className="text-[10px] text-slate-400">Approval</span>
              </label>
              <button onClick={() => removeRule(rule.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
