"use client";
import React, { useState } from "react";
import { Database, Play, CheckCircle, XCircle, Clock, RefreshCw, Zap } from "lucide-react";

type PipelineStatus = "idle"|"running"|"success"|"error";

const PIPELINES = [
  { id:"ETL-001", name:"Competitor Price Scraper",     schedule:"Every 4h",    lastRun:"2026-05-17 20:00", status:"success" as PipelineStatus, records:1240, duration:"1m 12s" },
  { id:"ETL-002", name:"Price History Aggregator",     schedule:"Daily 02:00", lastRun:"2026-05-17 02:00", status:"success" as PipelineStatus, records:8730, duration:"3m 44s" },
  { id:"ETL-003", name:"Recommendation ML Pipeline",   schedule:"Daily 03:00", lastRun:"2026-05-17 03:02", status:"success" as PipelineStatus, records:15,   duration:"8m 21s" },
  { id:"ETL-004", name:"Alert Event Generator",        schedule:"Every 1h",    lastRun:"2026-05-17 23:00", status:"success" as PipelineStatus, records:6,    duration:"0m 8s"  },
  { id:"ETL-005", name:"Product Catalog Sync",         schedule:"Daily 01:00", lastRun:"2026-05-17 01:00", status:"success" as PipelineStatus, records:5,    duration:"0m 5s"  },
  { id:"ETL-006", name:"Market Index Calculator",      schedule:"Every 6h",    lastRun:"2026-05-17 18:00", status:"error"   as PipelineStatus, records:0,    duration:"0m 30s", error:"Connection timeout to data source" },
];

const LOG_LINES = [
  "[2026-05-17 20:01:12] ETL-001 ▶ Starting competitor price scrape for 5 products × 7 competitors",
  "[2026-05-17 20:01:14] ETL-001 ✓ Product P-1001 scraped: 7 prices collected",
  "[2026-05-17 20:01:16] ETL-001 ✓ Product P-1042 scraped: 7 prices collected",
  "[2026-05-17 20:01:18] ETL-001 ✓ Product P-2011 scraped: 5 prices collected",
  "[2026-05-17 20:01:20] ETL-001 ✓ Product P-1089 scraped: 7 prices collected",
  "[2026-05-17 20:01:22] ETL-001 ✓ Product P-3301 scraped: 6 prices collected",
  "[2026-05-17 20:02:24] ETL-001 ✓ 1240 rows upserted into scraped_data",
  "[2026-05-17 20:02:24] ETL-001 ✅ Pipeline complete in 1m 12s",
  "[2026-05-17 18:30:03] ETL-006 ▶ Starting market index calculation",
  "[2026-05-17 18:30:33] ETL-006 ❌ Connection timeout to external data source after 30s",
  "[2026-05-17 18:30:33] ETL-006 ❌ Pipeline failed — will retry in 6h",
];

function statusBadge(s:PipelineStatus){
  if(s==="success") return <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3"/>Success</span>;
  if(s==="error")   return <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3"/>Error</span>;
  if(s==="running") return <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full"><RefreshCw className="w-3 h-3 animate-spin"/>Running</span>;
  return <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3"/>Idle</span>;
}

export default function DataEngineerPage() {
  const [pipelines,setPipelines]=useState(PIPELINES);
  const [activeLog,setActiveLog]=useState<string|null>(null);

  function runPipeline(id:string){
    setPipelines(prev=>prev.map(p=>p.id===id?{...p,status:"running" as PipelineStatus}:p));
    setTimeout(()=>{
      setPipelines(prev=>prev.map(p=>p.id===id?{...p,status:"success" as PipelineStatus,lastRun:new Date().toISOString().slice(0,16).replace("T"," ")}:p));
    },2500);
  }

  const healthy=pipelines.filter(p=>p.status==="success").length;
  const failed=pipelines.filter(p=>p.status==="error").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Database className="w-6 h-6 text-indigo-500"/>ETL Pipelines
          </h1>
          <p className="text-sm text-slate-500 mt-1">Monitor and trigger data ingestion pipelines.</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {label:"Healthy",value:healthy,color:"text-green-600 bg-green-50",icon:CheckCircle},
          {label:"Failed",value:failed,color:"text-red-500 bg-red-50",icon:XCircle},
          {label:"Total Pipelines",value:pipelines.length,color:"text-indigo-600 bg-indigo-50",icon:Database},
        ].map(({label,value,color,icon:Icon})=>(
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4"/></div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pipeline Status</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900">
              <th className="text-left p-4 font-semibold">Pipeline</th>
              <th className="p-4 font-semibold text-center">Schedule</th>
              <th className="p-4 font-semibold text-center">Last Run</th>
              <th className="p-4 font-semibold text-center">Records</th>
              <th className="p-4 font-semibold text-center">Duration</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pipelines.map(p=>(
              <tr key={p.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{p.name}</p>
                  {p.error&&<p className="text-[10px] text-red-500 mt-0.5">{p.error}</p>}
                  <p className="text-[10px] text-slate-400">{p.id}</p>
                </td>
                <td className="p-4 text-center text-xs text-slate-500">{p.schedule}</td>
                <td className="p-4 text-center text-xs text-slate-500">{p.lastRun}</td>
                <td className="p-4 text-center text-xs text-slate-600">{p.records.toLocaleString()}</td>
                <td className="p-4 text-center text-xs text-slate-500">{p.duration}</td>
                <td className="p-4 text-center">{statusBadge(p.status)}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={()=>runPipeline(p.id)} disabled={p.status==="running"}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors">
                      <Play className="w-3 h-3"/>{p.status==="running"?"Running…":"Run"}
                    </button>
                    <button onClick={()=>setActiveLog(activeLog===p.id?null:p.id)}
                      className="px-2 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs rounded-lg">
                      Logs
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log viewer */}
      {activeLog&&(
        <div className="bg-slate-950 rounded-2xl border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/>Log Viewer — {activeLog}</h2>
            <button onClick={()=>setActiveLog(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕ Close</button>
          </div>
          <div className="font-mono text-[11px] text-slate-300 space-y-1 max-h-56 overflow-y-auto">
            {LOG_LINES.filter(l=>l.includes(activeLog)||activeLog==="all").map((l,i)=>(
              <p key={i} className={l.includes("❌")?"text-red-400":l.includes("✅")||l.includes("✓")?"text-green-400":"text-slate-400"}>{l}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
