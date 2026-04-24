"use client";
import React, { useState } from "react";
import { Plus, Trash2, Bell, BellOff } from "lucide-react";
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";

export default function AlertRules() {
  const { data: initialRules } = useAnalyticsData<any[]>({ section: "alert-rules" });
  const [rules, setRules] = useState<any[] | null>(null);
  const activeRules = rules || initialRules || [];

  const toggleActive = (id: string) => {
    const updated = activeRules.map((r: any) => r.id === id ? { ...r, active: !r.active } : r);
    setRules(updated);
  };
  const removeRule = (id: string) => setRules(activeRules.filter((r: any) => r.id !== id));
  const addRule = () => {
    setRules([...activeRules, { id: `AR-${Date.now()}`, name: "New Rule", condition: "Define condition...", channel: "in-app", active: true, created_at: new Date().toISOString() }]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wide">Alert</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Price Alert Rules</h3>
        </div>
        <button onClick={addRule} className="flex items-center gap-1 text-[11px] text-blue-600 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {activeRules.map((rule: any) => (
          <div key={rule.id} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${rule.active ? "border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10" : "border-slate-100 dark:border-slate-800 opacity-50"}`}>
            <button onClick={() => toggleActive(rule.id)} className="shrink-0">
              {rule.active ? <Bell className="w-4 h-4 text-amber-600" /> : <BellOff className="w-4 h-4 text-slate-400" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{rule.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{rule.condition}</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">{rule.channel}</span>
            <button onClick={() => removeRule(rule.id)} className="text-slate-400 hover:text-rose-500 shrink-0"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
