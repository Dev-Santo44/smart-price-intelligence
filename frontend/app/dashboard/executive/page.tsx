"use client";
import React, { useState } from "react";
import { TrendingUp, DollarSign, Target, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";

const PRODUCTS = [
  { id:"P-1001", name:"Wireless Headphones X1",      price:96.50,  revenue:482500, margin:22.4, winRate:68, trend:3.8 },
  { id:"P-1042", name:"Smart Speaker Plus",           price:149.00, revenue:745000, margin:18.1, winRate:54, trend:-2.1 },
  { id:"P-2011", name:"USB-C Hub Pro 7-in-1",         price:54.00,  revenue:270000, margin:22.0, winRate:71, trend:1.4 },
  { id:"P-1089", name:"Noise Cancel Pro Earbuds",     price:210.00, revenue:1050000,margin:24.3, winRate:62, trend:4.2 },
  { id:"P-3301", name:"BT Mechanical Keyboard Elite", price:78.00,  revenue:390000, margin:15.8, winRate:48, trend:-6.1 },
];

const MONTHS = ["Nov","Dec","Jan","Feb","Mar","Apr"];
const REV_DATA = [3.2,3.8,4.1,4.6,5.0,5.3];
const MARGIN_DATA = [19.1,19.8,20.2,20.8,21.1,20.6];

export default function ExecutivePage() {
  const [tab,setTab]=useState<"revenue"|"margin"|"winrate">("revenue");
  const totalRev = PRODUCTS.reduce((s,p)=>s+p.revenue,0);
  const avgMargin = PRODUCTS.reduce((s,p)=>s+p.margin,0)/PRODUCTS.length;
  const avgWin = PRODUCTS.reduce((s,p)=>s+p.winRate,0)/PRODUCTS.length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <TrendingUp className="w-6 h-6 text-indigo-500"/>Strategic Insights
        </h1>
        <p className="text-sm text-slate-500 mt-1">Executive-level view of revenue, margin, and pricing performance.</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label:"Total ARR", value:`$${(totalRev/1000).toFixed(0)}K`, sub:"across 5 products", icon:DollarSign, color:"text-indigo-600 bg-indigo-50", change:"+12.4%" },
          { label:"Avg Gross Margin", value:`${avgMargin.toFixed(1)}%`, sub:"target: 20%", icon:Target, color:"text-green-600 bg-green-50", change:"+1.8pp" },
          { label:"Avg Win Rate", value:`${avgWin.toFixed(0)}%`, sub:"enterprise + SMB", icon:Award, color:"text-amber-600 bg-amber-50", change:"-2.1pp" },
        ].map(({label,value,sub,icon:Icon,color,change})=>(
          <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${color}`}><Icon className="w-5 h-5"/></div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${change.startsWith("+")?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>{change}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{label}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Trend chart (visual bar) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex-1">Performance Trend (6 Months)</h2>
          <div className="flex gap-1">
            {(["revenue","margin","winrate"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${tab===t?"bg-indigo-600 text-white":"bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                {t==="revenue"?"Revenue":t==="margin"?"Margin":"Win Rate"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {MONTHS.map((m,i)=>{
            const raw=tab==="revenue"?REV_DATA[i]:tab==="margin"?MARGIN_DATA[i]:[62,58,61,63,65,60][i];
            const max=tab==="revenue"?6:tab==="margin"?24:70;
            const h=Math.round((raw/max)*100);
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500 font-semibold">
                  {tab==="revenue"?`$${raw}M`:`${raw}%`}
                </span>
                <div className="w-full bg-indigo-600 rounded-t-md transition-all duration-500" style={{height:`${h}%`}}/>
                <span className="text-[10px] text-slate-400">{m}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product performance table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Product Performance</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 text-xs text-slate-500">
              <th className="text-left p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold text-center">Price</th>
              <th className="p-4 font-semibold text-center">Revenue</th>
              <th className="p-4 font-semibold text-center">Margin</th>
              <th className="p-4 font-semibold text-center">Win Rate</th>
              <th className="p-4 font-semibold text-center">Trend</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map(p=>(
              <tr key={p.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.id}</p>
                </td>
                <td className="p-4 text-center font-semibold text-slate-900 dark:text-slate-100">${p.price}</td>
                <td className="p-4 text-center text-slate-700 dark:text-slate-300">${(p.revenue/1000).toFixed(0)}K</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.margin>=20?"bg-green-100 text-green-700":p.margin>=18?"bg-amber-100 text-amber-700":"bg-red-100 text-red-700"}`}>
                    {p.margin}%
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-indigo-500" style={{width:`${p.winRate}%`}}/>
                    </div>
                    <span className="text-xs text-slate-600">{p.winRate}%</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`flex items-center justify-center gap-1 text-xs font-semibold ${p.trend>0?"text-green-600":"text-red-500"}`}>
                    {p.trend>0?<ArrowUpRight className="w-3 h-3"/>:<ArrowDownRight className="w-3 h-3"/>}
                    {Math.abs(p.trend)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
