"use client";
import React, { useState } from "react";
import { FileText, Download, Filter, Calendar, Search, CheckCircle } from "lucide-react";

const REPORTS = [
  { id:"RPT-001", name:"Price Competitiveness Report",    category:"Pricing",      generated:"2026-05-16", rows:1240, status:"ready" },
  { id:"RPT-002", name:"Competitor Price History — 90d",  category:"Competitors",  generated:"2026-05-15", rows:8730, status:"ready" },
  { id:"RPT-003", name:"Recommendation Acceptance Rate",  category:"ML/AI",        generated:"2026-05-14", rows:342,  status:"ready" },
  { id:"RPT-004", name:"Margin Impact Analysis Q2 2026",  category:"Finance",      generated:"2026-05-12", rows:510,  status:"ready" },
  { id:"RPT-005", name:"Win/Loss Attribution Report",     category:"Sales",        generated:"2026-05-10", rows:2180, status:"ready" },
  { id:"RPT-006", name:"Model Accuracy Monthly Summary",  category:"ML/AI",        generated:"2026-05-08", rows:72,   status:"ready" },
  { id:"RPT-007", name:"Alert Events Log — April 2026",   category:"Operations",   generated:"2026-05-01", rows:441,  status:"ready" },
  { id:"RPT-008", name:"Data Quality Audit",              category:"Operations",   generated:"2026-04-30", rows:96,   status:"ready" },
];
const CATEGORIES = ["All","Pricing","Competitors","ML/AI","Finance","Sales","Operations"];

export default function ReportsPage() {
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("All");
  const [downloading,setDownloading]=useState<string|null>(null);

  const filtered = REPORTS.filter(r=>{
    const matchCat = cat==="All" || r.category===cat;
    const matchQ = r.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  function simulateDownload(id:string){
    setDownloading(id);
    setTimeout(()=>setDownloading(null),1800);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <FileText className="w-6 h-6 text-indigo-500"/>Reports &amp; Exports
          </h1>
          <p className="text-sm text-slate-500 mt-1">Download pricing intelligence reports as CSV or Excel.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">
          <FileText className="w-4 h-4"/>Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {label:"Reports Available",value:REPORTS.length.toString()},
          {label:"Total Records",value:REPORTS.reduce((s,r)=>s+r.rows,0).toLocaleString()},
          {label:"Categories",value:"6"},
        ].map(({label,value})=>(
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"/>
          <input
            type="text" placeholder="Search reports…"
            value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${cat===c?"bg-indigo-600 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Report list */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500">
              <th className="text-left p-4 font-semibold">Report Name</th>
              <th className="p-4 font-semibold text-center">Category</th>
              <th className="p-4 font-semibold text-center">Generated</th>
              <th className="p-4 font-semibold text-center">Records</th>
              <th className="p-4 font-semibold text-center">Download</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{r.name}</p>
                  <p className="text-[10px] text-slate-400">{r.id}</p>
                </td>
                <td className="p-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600">{r.category}</span>
                </td>
                <td className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3"/>{r.generated}
                </td>
                <td className="p-4 text-center text-xs text-slate-600">{r.rows.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={()=>simulateDownload(r.id)}
                      disabled={downloading===r.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-semibold rounded-lg transition-all disabled:opacity-50">
                      {downloading===r.id
                        ?<><CheckCircle className="w-3 h-3 text-green-500"/>Saved!</>
                        :<><Download className="w-3 h-3"/>CSV</>}
                    </button>
                    <button onClick={()=>simulateDownload(r.id+"x")}
                      disabled={downloading===r.id+"x"}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-lg transition-all disabled:opacity-50">
                      {downloading===r.id+"x"
                        ?<><CheckCircle className="w-3 h-3"/>Saved!</>
                        :<><Download className="w-3 h-3"/>XLSX</>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length===0&&(
              <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-sm">No reports match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
