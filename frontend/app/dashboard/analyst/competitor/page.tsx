"use client";
import React, { useState } from "react";
import { BarChart2, TrendingDown, TrendingUp, Minus, AlertTriangle, RefreshCw } from "lucide-react";

const COMPETITORS = ["BrandZ","AlphaCo","NovaTech","PrimeSys","CoreEdge","StellarGear","ApexSound"];
const PRODUCTS = [
  { id:"P-1001", name:"Wireless Headphones X1",      yours:96.50,  category:"Audio" },
  { id:"P-1042", name:"Smart Speaker Plus",           yours:149.00, category:"Smart Home" },
  { id:"P-2011", name:"USB-C Hub Pro 7-in-1",         yours:54.00,  category:"Accessories" },
  { id:"P-1089", name:"Noise Cancel Pro Earbuds",     yours:210.00, category:"Audio" },
  { id:"P-3301", name:"BT Mechanical Keyboard Elite", yours:78.00,  category:"Peripherals" },
];
function r(min:number,max:number){return parseFloat((Math.random()*(max-min)+min).toFixed(2));}
const HEATMAP = PRODUCTS.map(p=>({...p, competitors:COMPETITORS.map(c=>({name:c,price:r(p.yours*0.85,p.yours*1.18)}))}));
function badge(yours:number,comp:number){
  const pct=((comp-yours)/yours)*100;
  if(pct>5) return {label:`+${pct.toFixed(1)}%`,cls:"bg-green-100 text-green-700"};
  if(pct<-5) return {label:`${pct.toFixed(1)}%`,cls:"bg-red-100 text-red-700"};
  return {label:`${pct>0?"+":""}${pct.toFixed(1)}%`,cls:"bg-slate-100 text-slate-600"};
}
const MOVES=[
  {product:"BT Mechanical Keyboard Elite",competitor:"AlphaCo",old:76,nw:69,pct:-9.2,days:4},
  {product:"Wireless Headphones X1",competitor:"BrandZ",old:91,nw:98.7,pct:8.5,days:6},
  {product:"Smart Speaker Plus",competitor:"NovaTech",old:145,nw:138.5,pct:-4.5,days:7},
  {product:"Noise Cancel Pro Earbuds",competitor:"BrandZ",old:219,nw:224,pct:2.3,days:5},
  {product:"USB-C Hub Pro 7-in-1",competitor:"CoreEdge",old:53,nw:51,pct:-3.8,days:9},
];

export default function CompetitorMonitoringPage() {
  const [sel,setSel]=useState("All");
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-500"/>Competitor Monitoring
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time competitor price tracking across all products.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium">
          <RefreshCw className="w-4 h-4"/>Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {label:"Competitors Tracked",value:"7",icon:BarChart2,color:"text-indigo-600 bg-indigo-50"},
          {label:"Price Drops (7d)",value:"3",icon:TrendingDown,color:"text-red-500 bg-red-50"},
          {label:"Price Raises (7d)",value:"2",icon:TrendingUp,color:"text-green-600 bg-green-50"},
          {label:"Avg Market Index",value:"98.4",icon:Minus,color:"text-amber-600 bg-amber-50"},
        ].map(({label,value,icon:Icon,color})=>(
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${color}`}><Icon className="w-4 h-4"/></div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Competitor filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">Filter:</span>
        {["All",...COMPETITORS].map(c=>(
          <button key={c} onClick={()=>setSel(c)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${sel===c?"bg-indigo-600 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6 overflow-x-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Price Comparison Heatmap</h2>
          <p className="text-xs text-slate-400 mt-0.5">Green = competitor charges more (your advantage). Red = they charge less (competitive risk).</p>
        </div>
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="text-left p-3 font-semibold text-slate-600 dark:text-slate-400">Product</th>
              <th className="p-3 font-semibold text-slate-600 text-center">Your Price</th>
              {(sel==="All"?COMPETITORS:[sel]).map(c=>(
                <th key={c} className="p-3 font-semibold text-slate-600 text-center">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HEATMAP.map(p=>(
              <tr key={p.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <td className="p-3">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.category} · {p.id}</p>
                </td>
                <td className="p-3 text-center font-semibold">${p.yours.toFixed(2)}</td>
                {(sel==="All"?p.competitors:p.competitors.filter(c=>c.name===sel)).map(c=>{
                  const b=badge(p.yours,c.price);
                  return (
                    <td key={c.name} className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">${c.price.toFixed(2)}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${b.cls}`}>{b.label}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent moves */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500"/>Recent Price Moves (Last 14 days)
          </h2>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-700">
          {MOVES.map((m,i)=>(
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <div className={`p-2 rounded-lg shrink-0 ${m.pct<0?"bg-red-50":"bg-green-50"}`}>
                {m.pct<0?<TrendingDown className="w-4 h-4 text-red-500"/>:<TrendingUp className="w-4 h-4 text-green-500"/>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{m.competitor} — {m.product}</p>
                <p className="text-xs text-slate-400">{m.days}d ago · ${m.old.toFixed(2)} → ${m.nw.toFixed(2)}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${m.pct<0?"bg-red-100 text-red-700":"bg-green-100 text-green-700"}`}>
                {m.pct>0?"+":""}{m.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
