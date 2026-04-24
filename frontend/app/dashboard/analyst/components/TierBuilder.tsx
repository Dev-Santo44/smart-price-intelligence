"use client";
import React, { useState } from "react";
import { GripVertical, Plus, Trash2, Check } from "lucide-react";

const DEFAULT_TIERS = [
  { id: "t1", name: "Good", price: 900, segment: "SMB", features: ["API Access", "Email Support", "5 Users"], color: "bg-slate-100 dark:bg-slate-800" },
  { id: "t2", name: "Better", price: 2400, segment: "Mid-Market", features: ["API Access", "Email Support", "5 Users", "SSO/SAML", "Custom Reports", "25 Users"], color: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "t3", name: "Best", price: 5988, segment: "Enterprise", features: ["API Access", "Email Support", "5 Users", "SSO/SAML", "Custom Reports", "25 Users", "24/7 Support", "SLA 99.9%", "Unlimited Users"], color: "bg-indigo-50 dark:bg-indigo-900/20" },
];

const ALL_FEATURES = ["API Access", "Email Support", "5 Users", "25 Users", "Unlimited Users", "SSO/SAML", "Custom Reports", "24/7 Support", "SLA 99.9%", "Audit Logs", "Multi-Region"];

export default function TierBuilder() {
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const updateTier = (id: string, field: string, value: any) => {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };
  const toggleFeature = (tierId: string, feature: string) => {
    setTiers(prev => prev.map(t => {
      if (t.id !== tierId) return t;
      const has = t.features.includes(feature);
      return { ...t, features: has ? t.features.filter(f => f !== feature) : [...t.features, feature] };
    }));
  };
  const addTier = () => {
    setTiers(prev => [...prev, { id: `t${Date.now()}`, name: "New Tier", price: 0, segment: "", features: [], color: "bg-slate-50 dark:bg-slate-800" }]);
  };
  const removeTier = (id: string) => setTiers(prev => prev.filter(t => t.id !== id));

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    const newTiers = [...tiers];
    const [moved] = newTiers.splice(dragIndex, 1);
    newTiers.splice(i, 0, moved);
    setTiers(newTiers);
    setDragIndex(i);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wide">Plan</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Pricing Tier Builder</h3>
        </div>
        <button onClick={addTier} className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
          <Plus className="w-3 h-3" /> Add Tier
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tiers.map((tier, i) => (
          <div key={tier.id} draggable onDragStart={() => handleDragStart(i)} onDragOver={e => handleDragOver(e, i)} onDragEnd={() => setDragIndex(null)}
            className={`${tier.color} border border-slate-200 dark:border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-shadow ${dragIndex === i ? "shadow-lg ring-2 ring-blue-400" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <GripVertical className="w-3.5 h-3.5 text-slate-400" />
              <button onClick={() => removeTier(tier.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
            </div>
            <input value={tier.name} onChange={e => updateTier(tier.id, "name", e.target.value)}
              className="w-full text-sm font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 outline-none mb-2 text-slate-800 dark:text-slate-200" />
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-slate-400">₹</span>
              <input type="number" value={tier.price} onChange={e => updateTier(tier.id, "price", Number(e.target.value))}
                className="w-20 text-sm font-bold bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200" />
              <span className="text-[10px] text-slate-400">/yr</span>
            </div>
            <input value={tier.segment} onChange={e => updateTier(tier.id, "segment", e.target.value)} placeholder="Target segment"
              className="w-full text-[10px] px-2 py-1 rounded bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 mb-2 outline-none" />
            <div className="space-y-1">
              {ALL_FEATURES.map(f => (
                <label key={f} className="flex items-center gap-1.5 cursor-pointer group">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${tier.features.includes(f) ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600 group-hover:border-emerald-400"}`}
                    onClick={() => toggleFeature(tier.id, f)}>
                    {tier.features.includes(f) && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">{f}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
