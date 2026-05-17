"use client";
import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, RefreshCw, Clock } from "lucide-react";

type CheckStatus = "pass"|"warn"|"fail";

const CHECKS = [
  { id:"DQ-001", table:"products",      check:"Row count > 0",                    status:"pass" as CheckStatus, value:"5 rows",      lastRun:"2026-05-17 23:00" },
  { id:"DQ-002", table:"products",      check:"No null product_id",               status:"pass" as CheckStatus, value:"0 nulls",     lastRun:"2026-05-17 23:00" },
  { id:"DQ-003", table:"scraped_data",  check:"Data freshness < 24h",             status:"pass" as CheckStatus, value:"3h ago",      lastRun:"2026-05-17 23:00" },
  { id:"DQ-004", table:"scraped_data",  check:"Price values > 0",                 status:"pass" as CheckStatus, value:"All valid",   lastRun:"2026-05-17 23:00" },
  { id:"DQ-005", table:"recommendations","check":"Confidence between 0–100",      status:"pass" as CheckStatus, value:"92% avg",     lastRun:"2026-05-17 23:00" },
  { id:"DQ-006", table:"recommendations","check":"No orphaned product references",status:"warn" as CheckStatus, value:"2 warnings",  lastRun:"2026-05-17 23:00", detail:"2 recommendations reference products not in scraped_data" },
  { id:"DQ-007", table:"price_history", check:"Timestamp ordering consistent",    status:"pass" as CheckStatus, value:"Ordered",     lastRun:"2026-05-17 23:00" },
  { id:"DQ-008", table:"competitors",   check:"Row count >= 5",                   status:"pass" as CheckStatus, value:"7 rows",      lastRun:"2026-05-17 23:00" },
  { id:"DQ-009", table:"alert_events",  check:"No duplicate event IDs",           status:"pass" as CheckStatus, value:"Unique",      lastRun:"2026-05-17 23:00" },
  { id:"DQ-010", table:"model_accuracy", check:"MAPE within acceptable range",    status:"warn" as CheckStatus, value:"4.2% MAPE",   lastRun:"2026-05-17 23:00", detail:"MAPE 4.2% is above the 4.0% target threshold" },
];

function statusIcon(s:CheckStatus){
  if(s==="pass") return <CheckCircle className="w-4 h-4 text-green-500"/>;
  if(s==="warn") return <AlertTriangle className="w-4 h-4 text-amber-500"/>;
  return <XCircle className="w-4 h-4 text-red-500"/>;
}
function statusBadge(s:CheckStatus){
  if(s==="pass") return "bg-green-50 text-green-700";
  if(s==="warn") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

const TABLES = [...new Set(CHECKS.map(c=>c.table))];

export default function DataQualityPage() {
  const [running,setRunning]=useState(false);
  const [filter,setFilter]=useState<"all"|CheckStatus>("all");

  const filtered = CHECKS.filter(c=>filter==="all"||c.status===filter);
  const pass=CHECKS.filter(c=>c.status==="pass").length;
  const warn=CHECKS.filter(c=>c.status==="warn").length;
  const fail=CHECKS.filter(c=>c.status==="fail").length;
  const score=Math.round((pass/CHECKS.length)*100);

  function runChecks(){
    setRunning(true);
    setTimeout(()=>setRunning(false),2200);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <ShieldCheck className="w-6 h-6 text-indigo-500"/>Data Quality
          </h1>
          <p className="text-sm text-slate-500 mt-1">Automated checks across all database tables to ensure data integrity.</p>
        </div>
        <button onClick={runChecks} disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${running?"animate-spin":""}`}/>
          {running?"Running checks…":"Run All Checks"}
        </button>
      </div>

      {/* Score + KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="sm:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 mb-3">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={score>=90?"#22c55e":score>=70?"#f59e0b":"#ef4444"}
                strokeWidth="3" strokeDasharray={`${score} ${100-score}`} strokeLinecap="round"/>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900 dark:text-slate-100">{score}%</span>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quality Score</p>
        </div>
        {[
          {label:"Passed",value:pass,icon:CheckCircle,color:"text-green-600 bg-green-50"},
          {label:"Warnings",value:warn,icon:AlertTriangle,color:"text-amber-600 bg-amber-50"},
          {label:"Failed",value:fail,icon:XCircle,color:"text-red-500 bg-red-50"},
        ].map(({label,value,icon:Icon,color})=>(
          <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${color}`}><Icon className="w-5 h-5"/></div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        {(["all","pass","warn","fail"] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter===f?"bg-indigo-600 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {f==="all"?"All":f==="pass"?"✅ Passed":f==="warn"?"⚠️ Warnings":"❌ Failed"}
          </button>
        ))}
      </div>

      {/* Checks table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500">
              <th className="text-left p-4 font-semibold">Check</th>
              <th className="p-4 font-semibold text-center">Table</th>
              <th className="p-4 font-semibold text-center">Result</th>
              <th className="p-4 font-semibold text-center">Last Run</th>
              <th className="p-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{c.check}</p>
                  {c.detail&&<p className="text-[10px] text-amber-600 mt-0.5">{c.detail}</p>}
                  <p className="text-[10px] text-slate-400">{c.id}</p>
                </td>
                <td className="p-4 text-center">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-600">{c.table}</span>
                </td>
                <td className="p-4 text-center text-xs text-slate-600 font-medium">{c.value}</td>
                <td className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3"/>{c.lastRun}
                </td>
                <td className="p-4 text-center">
                  <span className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(c.status)}`}>
                    {statusIcon(c.status)}
                    {c.status==="pass"?"Pass":c.status==="warn"?"Warn":"Fail"}
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
