"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- Types ---
interface DashData {
  kpis: any[];
  priceSeries: any[];
  recent: any[];
  recommendations: any[];
  total: number;
}

// --- Constants ---
const COLORS = {
  blue: { mid: "#378ADD", light: "#E6F1FB", dark: "#0C447C" },
  teal: { mid: "#1D9E75", light: "#E1F5EE", dark: "#085041" },
  amber: { mid: "#EF9F27", light: "#FAEEDA", dark: "#633806" },
  red: { mid: "#E24B4A", light: "#FCEBEB", dark: "#791F1F" },
  purple: { mid: "#7F77DD", light: "#EEEDFE", dark: "#3C3489" },
  gray: { mid: "#888780", light: "#F1EFE8", dark: "#444441" },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRange, setActiveRange] = useState("7d");
  const router = useRouter();

  // Logic: Fetch dashboard data (matching existing logic)
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard?page=1&pageSize=5`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRecommendationAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/recommendations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update recommendation");
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading && !data) return (
    <div className="min-h-screen bg-[var(--color-background-tertiary)] p-5 flex items-center justify-center">
      <div className="text-sm text-[var(--color-text-secondary)]">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-background-tertiary)] p-5 space-y-5 flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-medium text-[var(--color-text-primary)]">Pricing dashboard</h1>
          <div className="text-[12px] text-[var(--color-text-tertiary)]">Last sync: {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
        <div className="flex items-center gap-1 bg-[var(--color-background-secondary)] p-1 rounded-lg border-[0.5px] border-[var(--color-border-tertiary)] shadow-sm">
          {["7d", "30d", "90d", "Custom"].map((r) => (
            <button
              key={r}
              onClick={() => setActiveRange(r)}
              className={`px-3 py-1.5 text-[11px] rounded-[4px] transition-all ${
                activeRange === r 
                ? "bg-[#378ADD] text-white font-medium" 
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      {/* KPI Row */}
      <section className="grid grid-cols-4 gap-4 px-0.5">
        {[
          { label: "Products monitored", value: data?.kpis?.find(k => k.id === "products")?.value || "3", delta: "+3.4%", color: COLORS.blue.mid, context: "" },
          { label: "Active competitors", value: data?.kpis?.find(k => k.id === "competitors")?.value || "24", delta: "-1.2%", color: COLORS.purple.mid, context: "2 exited market", negative: true },
          { label: "Pending recommendations", value: data?.kpis?.find(k => k.id === "recommendations")?.value || "3", delta: "+5.1%", color: COLORS.amber.mid, context: "2 high priority" },
          { label: "Pricing opportunities", value: data?.kpis?.find(k => k.id === "opportunities")?.value || "9", delta: "+12.3%", color: COLORS.teal.mid, context: "est. +$4.2K/mo" },
        ].map((kpi, i) => (
          <div key={i} className="bg-[var(--color-background-primary)] p-4 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] shadow-sm relative overflow-hidden flex flex-col gap-2">
            <div className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider">{kpi.label}</div>
            <div className="flex items-end gap-3">
              <div className="text-[26px] font-medium text-[var(--color-text-primary)] leading-none">{kpi.value}</div>
              <div className="pb-0.5 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${kpi.negative ? "bg-[#FCEBEB] text-[#791F1F]" : "bg-[#E1F5EE] text-[#085041]"}`}>
                  {kpi.delta}
                </span>
                {kpi.context && <span className="text-[11px] text-[var(--color-text-tertiary)] whitespace-nowrap">{kpi.context}</span>}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: "var(--color-background-tertiary)" }}>
               <div className="h-full" style={{ width: "65%", backgroundColor: kpi.color }} />
            </div>
          </div>
        ))}
      </section>

      {/* Middle Row */}
      <section className="grid grid-cols-12 gap-4">
        {/* Left: Price Competitiveness */}
        <div className="col-span-8 bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] shadow-sm flex flex-col">
          <h2 className="text-[13px] font-medium mb-1">Price competitiveness — last 7 days</h2>
          
          <div className="flex-1 mt-6 relative h-48 flex items-end justify-between px-2">
             <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none opacity-50">
               {[1, 2, 3, 4].map(l => <div key={l} className="w-full border-t border-[var(--color-border-tertiary)]" />)}
             </div>

             {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
               const values = [
                 [96.5, 94.1, 98.5],
                 [96.5, 94.8, 98.5],
                 [97.2, 95.2, 99.0],
                 [97.2, 95.6, 99.0],
                 [96.5, 95.0, 98.5],
                 [96.5, 94.5, 98.0],
                 [96.5, 94.3, 99.0],
               ][i];
               
               return (
                 <div key={day} className="flex-1 flex flex-col items-center gap-2 group z-10">
                   <div className="flex items-end gap-[2px] h-full">
                     <div className="w-[8px] bg-[#378ADD] rounded-t-[1px]" style={{ height: `${(values[0] / 110) * 100}%` }} title={`Your: $${values[0]}`} />
                     <div className="w-[8px] bg-[#888780] rounded-t-[1px]" style={{ height: `${(values[1] / 110) * 100}%` }} title={`Market: $${values[1]}`} />
                     <div className="w-[8px] bg-[#1D9E75] rounded-t-[1px]" style={{ height: `${(values[2] / 110) * 100}%` }} title={`Rec: $${values[2]}`} />
                   </div>
                   <div className="text-[11px] text-[var(--color-text-tertiary)]">{day}</div>
                 </div>
               );
             })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-6">
            {[
              { label: "Your price", color: "#378ADD" },
              { label: "Market avg", color: "#888780" },
              { label: "Recommended", color: "#1D9E75" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[11px] text-[var(--color-text-secondary)]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Competitor Pricing */}
        <div className="col-span-4 bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] shadow-sm flex flex-col">
          <h2 className="text-[13px] font-medium">Competitor pricing</h2>
          <div className="text-[11px] text-[var(--color-text-tertiary)] mb-5">vs. your $96.50</div>
          
          <div className="space-y-4 flex-1">
            {[
              { name: "BrandZ", price: 98.70, delta: "+2.3%", color: COLORS.red },
              { name: "AlphaCo", price: 95.10, delta: "-1.4%", color: COLORS.amber },
              { name: "NovaTech", price: 92.00, delta: "-4.7%", color: COLORS.blue },
              { name: "PrimeSys", price: 89.50, delta: "-7.3%", color: COLORS.teal },
              { name: "CoreEdge", price: 86.20, delta: "-10.7%", color: COLORS.gray },
            ].map((comp, i) => {
              const maxPrice = 98.70;
              const width = (comp.price / maxPrice) * 100;
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[var(--color-text-secondary)] w-16 truncate">{comp.name}</span>
                    <div className="flex-1 px-3">
                      <div className="h-1.5 bg-[var(--color-background-tertiary)] rounded-full w-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: comp.color.mid }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium">${comp.price.toFixed(2)}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] min-w-[36px] text-center" style={{ backgroundColor: comp.color.light, color: comp.color.dark }}>
                        {comp.delta}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Row */}
      <section className="grid grid-cols-3 gap-4">
        {/* Col 1: ML Recommendations */}
        <div className="bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] shadow-sm">
          <h3 className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">ML recommendations</h3>
          <div className="space-y-3">
            {(data?.recommendations || []).slice(0, 3).map((item: any, i: number) => {
               const priorityColor = item.priority === "High" ? COLORS.red : item.priority === "Medium" ? COLORS.amber : COLORS.teal;
               return (
                <div key={i} className="bg-[var(--color-background-secondary)] p-3 rounded-[8px] flex gap-3 border border-transparent hover:border-[var(--color-border-tertiary)] transition-all">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: priorityColor.mid }} />
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="text-[12px] font-medium">{item.product}</div>
                      <div className="text-[11px] text-[var(--color-text-tertiary)]">Impact: {item.impact} • Conf: {item.confidence}%</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleRecommendationAction(item.id, "accept")} className="px-2 py-1 bg-[#378ADD] text-white text-[10px] rounded-[4px] font-medium">Accept</button>
                      <button onClick={() => handleRecommendationAction(item.id, "reject")} className="px-2 py-1 border-[0.5px] border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] text-[10px] rounded-[4px] hover:bg-white transition-all">Reject</button>
                      <button onClick={() => router.push(`/dashboard/analyst`)} className="px-2 py-1 border-[0.5px] border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] text-[10px] rounded-[4px] hover:bg-white transition-all">Review</button>
                    </div>
                  </div>
                </div>
               );
            })}
            {(!data?.recommendations || data.recommendations.length === 0) && (
              <div className="text-[11px] text-[var(--color-text-tertiary)] italic">No pending recommendations</div>
            )}
          </div>
        </div>

        {/* Col 2: Alerts */}
        <div className="bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] shadow-sm">
          <h3 className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">Alerts</h3>
          <div className="space-y-3">
            {[
              { title: "Competitor price drop", desc: "NovaTech reduced Nova X by 4.7%", time: "12m ago", color: COLORS.red },
              { title: "Margin dip warning", desc: "Product SKU_421 margin at 14.2%", time: "2h ago", color: COLORS.amber },
              { title: "Data sync complete", desc: "All sources updated successfully", time: "4h ago", color: COLORS.blue },
            ].map((alert, i) => (
              <div key={i} className="p-3 rounded-[8px] border-l-[3px] space-y-0.5" style={{ backgroundColor: alert.color.light, borderLeftColor: alert.color.mid }}>
                <div className="text-[12px] font-medium" style={{ color: alert.color.dark }}>{alert.title}</div>
                <div className="text-[11px] opacity-80" style={{ color: alert.color.dark }}>{alert.desc}</div>
                <div className="text-[10px] opacity-60 mt-1" style={{ color: alert.color.dark }}>{alert.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Pricing Opportunities */}
        <div className="bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] shadow-sm">
          <h3 className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">Pricing opportunities</h3>
          <div className="space-y-3">
            {[
              { name: "Enterprise SaaS", uplift: "+$1,840/mo", progress: 88, meta: "High confidence upward shift" },
              { name: "Support Tier A", uplift: "+$960/mo", progress: 62, meta: "Market alignment recommended" },
              { name: "Cloud SKU_12", uplift: "+$640/mo", progress: 44, meta: "Low win rate impact" },
              { name: "Backup Pro", uplift: "+$380/mo", progress: 28, meta: "Marginal gain opportunity" },
            ].map((op, i) => (
              <div key={i} className="bg-[var(--color-background-secondary)] p-3 rounded-[8px] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium">{op.name}</span>
                  <span className="text-[11px] text-[#1D9E75] font-medium">{op.uplift}</span>
                </div>
                <div>
                   <div className="h-1 bg-[var(--color-background-tertiary)] rounded-full overflow-hidden">
                     <div className="h-full bg-[#1D9E75] rounded-full" style={{ width: `${op.progress}%` }} />
                   </div>
                </div>
                <div className="text-[10px] text-[var(--color-text-tertiary)]">{op.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra: Quick Actions (Merged) */}
      <section className="bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] shadow-sm">
         <h3 className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">Quick actions</h3>
         <div className="grid grid-cols-4 gap-3">
            {["Upload CSV", "Run Analysis", "Generate Report", "Configure Alerts"].map(act => (
              <button key={act} className="py-2 px-3 text-[12px] rounded-[8px] border-[0.5px] border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] transition-all">
                {act}
              </button>
            ))}
         </div>
      </section>

      {/* Footer: Recent Activity (Merged) */}
      <section className="bg-[var(--color-background-primary)] rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] shadow-sm overflow-hidden mb-10">
        <div className="p-4 border-b-[0.5px] border-[var(--color-border-tertiary)] flex items-center justify-between">
           <h3 className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider">Recent price shifts</h3>
           <button onClick={() => router.push('/dashboard/analyst')} className="text-[11px] text-[#378ADD] font-medium">View full report</button>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[var(--color-background-secondary)] text-left">
              <th className="p-3 font-medium text-[var(--color-text-tertiary)]">Product</th>
              <th className="p-3 font-medium text-[var(--color-text-tertiary)]">Competitor</th>
              <th className="p-3 font-medium text-[var(--color-text-tertiary)]">Old</th>
              <th className="p-3 font-medium text-[var(--color-text-tertiary)]">New</th>
              <th className="p-3 font-medium text-[var(--color-text-tertiary)]">Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y-[0.5px] divide-[var(--color-border-tertiary)]">
            {(data?.recent || []).map((row: any, i: number) => (
              <tr key={i} className="hover:bg-[var(--color-background-secondary)] transition-all">
                <td className="p-3 font-medium">{row.name}</td>
                <td className="p-3 text-[var(--color-text-secondary)]">{row.competitor || 'N/A'}</td>
                <td className="p-3 text-[var(--color-text-secondary)]">${row.your_price}</td>
                <td className="p-3 font-medium">${row.competitor_price || row.your_price}</td>
                <td className={`p-3 font-medium ${row.change_pct >= 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>
                   {row.change_pct >= 0 ? '+' : ''}{row.change_pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
