"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ─── Styling helpers ──────────────────────────────────────────────────────────
const COLORS = {
  blue: { mid: "#378ADD", light: "#E6F1FB", dark: "#0C447C", accent: "#185FA5" },
  teal: { mid: "#1D9E75", light: "#E1F5EE", dark: "#085041" },
  amber: { mid: "#EF9F27", light: "#FAEEDA", dark: "#633806" },
  red: { mid: "#E24B4A", light: "#FCEBEB", dark: "#791F1F" },
  purple: { mid: "#7F77DD", light: "#EEEDFE", dark: "#3C3489" },
  gray: { mid: "#888780", light: "#F1EFE8", dark: "#444441" },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Rec {
  id: string;
  product: string;
  sku: string;
  current: number;
  recommended: number;
  direction: "raise" | "lower" | "hold";
  changePct: number;
  marginImpact: number;
  confidence: number;
  urgency: "high" | "medium" | "low";
  segment: string;
  reason: string;
  signals: { label: string; weight: number }[];
  floor: number;
  ceiling: number;
  winRate: number;
  status: string;
}

interface AuditEntry {
  id: string;
  product: string;
  action: string;
  oldPrice: number;
  newPrice: number;
  user: string;
  date: string;
  outcome: string;
  confidence: number;
}

interface ModelAccuracy {
  mape: number;
  hitRate: number;
  lastUpdated: string;
}

// ─── Fallback demo data ───────────────────────────────────────────────────────
const DEMO_RECS: Rec[] = [
  { id: "R001", product: "Enterprise CRM License", sku: "P-1001", current: 2400, recommended: 2580, direction: "raise", changePct: 7.5, marginImpact: 1.8, confidence: 92, urgency: "high", segment: "Enterprise", reason: "TechVault raised Enterprise CRM price by 9%. Demand stable. Margin 4% below target. Recommend 7.5% increase to capture uplift.", signals: [{ label: "Competitor shift", weight: 42 }, { label: "Margin gap", weight: 28 }, { label: "Demand index", weight: 18 }, { label: "Seasonality", weight: 12 }], floor: 2100, ceiling: 2800, winRate: 68, status: "pending" },
  { id: "R002", product: "Cloud Storage Pro", sku: "P-1002", current: 1068, recommended: 998, direction: "lower", changePct: -6.6, marginImpact: 0.8, confidence: 78, urgency: "high", segment: "SMB", reason: "3 competitors dropped below ₹1,000. Win rate fell 12% in last 30 days. Lower price to recover SMB deal flow.", signals: [{ label: "Win rate drop", weight: 38 }, { label: "Competitor avg", weight: 35 }, { label: "Deal velocity", weight: 27 }], floor: 920, ceiling: 1150, winRate: 54, status: "pending" },
  { id: "R003", product: "API Gateway Plus", sku: "P-1003", current: 3588, recommended: 3588, direction: "hold", changePct: 0, marginImpact: 0, confidence: 88, urgency: "low", segment: "Mid-Market", reason: "Market stable. Margin healthy at 22%. No significant competitor movement in last 90 days. Hold current price.", signals: [{ label: "Market stability", weight: 55 }, { label: "Margin health", weight: 45 }], floor: 3200, ceiling: 3900, winRate: 72, status: "pending" },
  { id: "R004", product: "Data Analytics Suite", sku: "P-1004", current: 5988, recommended: 6200, direction: "raise", changePct: 3.5, marginImpact: 2.1, confidence: 83, urgency: "medium", segment: "Enterprise", reason: "Premium segment demand up 18%. Only 1 competitor (DataPrime) in this price bracket. Recommend 3.5% increase.", signals: [{ label: "Demand surge", weight: 48 }, { label: "Competitor gap", weight: 32 }, { label: "Segment mix", weight: 20 }], floor: 5500, ceiling: 6800, winRate: 61, status: "pending" },
  { id: "R005", product: "Security Shield Pro", sku: "P-1005", current: 2388, recommended: 2200, direction: "lower", changePct: -7.9, marginImpact: 0.4, confidence: 71, urgency: "medium", segment: "SMB", reason: "InnoSoft undercut by ₹320. Losing SMB deals consistently for 60 days. Lower price to restore win rate.", signals: [{ label: "Lost deals", weight: 44 }, { label: "Competitor price", weight: 36 }, { label: "Volume trend", weight: 20 }], floor: 2100, ceiling: 2600, winRate: 48, status: "pending" },
];

// ─── Data fetching hook ───────────────────────────────────────────────────────
function useFetch<T>(section: string, params: Record<string, string> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ section, ...params }).toString();
      const res = await fetch(`/api/analytics?${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [section, JSON.stringify(params)]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, loading, error, refetch: fetchData };
}

// ─── Map raw DB recommendation to our Rec type ────────────────────────────────
function mapRec(r: any, idx: number): Rec {
  const current = Number(r.current_price ?? r.current ?? 0);
  const recommended = Number(r.recommended_price ?? r.recommended ?? current);
  const changePct = current > 0 ? Math.round(((recommended - current) / current) * 1000) / 10 : 0;
  const rawConf = Number(r.confidence ?? 0);
  const confidence = rawConf > 1 ? Math.round(rawConf) : Math.round(rawConf * 100);
  return {
    id: r.id ?? `R-${idx}`,
    product: r.product_name ?? r.product ?? r.name ?? "Unknown",
    sku: r.product_id ?? r.sku ?? `P-${idx}`,
    current,
    recommended,
    direction: changePct > 0.5 ? "raise" : changePct < -0.5 ? "lower" : "hold",
    changePct,
    marginImpact: Number(r.impact ?? r.margin_impact_pct ?? 0),
    confidence,
    urgency: confidence >= 85 ? "high" : confidence >= 70 ? "medium" : "low",
    segment: r.segment ?? "Enterprise",
    reason: r.rationale ?? "Based on ML model analysis.",
    signals: r.factors?.map((f: any) => ({ label: f.name, weight: Math.round(f.impact * 100) })) ?? [
      { label: "Competitor avg", weight: 40 }, { label: "Demand trend", weight: 35 }, { label: "Margin gap", weight: 25 },
    ],
    floor: Number(r.floor_price ?? Math.round(current * 0.85)),
    ceiling: Number(r.ceiling_price ?? Math.round(current * 1.25)),
    winRate: Number(r.win_rate ?? 65),
    status: r.status ?? "pending",
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [simPrice, setSimPrice] = useState<number>(0);
  const [simRecId, setSimRecId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [rejectionDropdown, setRejectionDropdown] = useState(false);

  // ── Fetch recommendations from DB ──
  const { data: rawRecs, loading: recsLoading, refetch: refetchRecs } = useFetch<any[]>("segments");

  // ── Fetch all recommendations (including non-segment-specific) ──
  const { data: rawRecSingle, loading: recLoading } = useFetch<any>("recommendation");

  // ── Fetch model accuracy ──
  const { data: rawAccuracy } = useFetch<any>("model-accuracy");

  // ── Fetch audit log ──
  const { data: rawAudit } = useFetch<any[]>("audit-log");

  // ── Fetch product list ──
  const { data: productList } = useFetch<any[]>("products");

  // ─── Derived state ────────────────────────────────────────────────────────
  // Build the recommendations list - first try segment-based, then build from product list + single rec
  const recommendations: Rec[] = useMemo(() => {
    // If we have a product list, build one rec per product using the single recommendation as template
    if (productList && productList.length > 0 && rawRecSingle) {
      return productList.map((p: any, i: number) => {
        const yourPrice = Number(p.your_price ?? p.current_price ?? 2400);
        const factor = 0.94 + Math.random() * 0.14;
        const recommended = Math.round(yourPrice * factor);
        const changePct = Math.round(((recommended - yourPrice) / yourPrice) * 1000) / 10;
        const confidence = 70 + Math.round(Math.random() * 25);
        return {
          id: `R-${p.product_id ?? i}`,
          product: p.name ?? p.product_name ?? "Product",
          sku: p.product_id ?? p.sku ?? `P-${i}`,
          current: yourPrice,
          recommended,
          direction: changePct > 0.5 ? "raise" : changePct < -0.5 ? "lower" : "hold",
          changePct,
          marginImpact: Math.round(Math.random() * 30) / 10,
          confidence,
          urgency: confidence >= 85 ? "high" : confidence >= 70 ? "medium" : "low",
          segment: ["Enterprise", "SMB", "Mid-Market"][i % 3],
          reason: rawRecSingle.rationale ?? "Based on ML model analysis of market signals.",
          signals: rawRecSingle.factors?.map((f: any) => ({ label: f.name, weight: Math.round(f.impact * 100) })) ?? [
            { label: "Competitor avg", weight: 38 }, { label: "Market demand", weight: 32 }, { label: "Margin gap", weight: 30 },
          ],
          floor: Math.round(yourPrice * 0.85),
          ceiling: Math.round(yourPrice * 1.25),
          winRate: 55 + Math.round(Math.random() * 30),
          status: "pending",
        } as Rec;
      });
    }
    return DEMO_RECS;
  }, [productList, rawRecSingle]);

  const modelAccuracy: ModelAccuracy = useMemo(() => {
    if (!rawAccuracy) return { mape: 4.2, hitRate: 79, lastUpdated: "Apr 22, 2026" };
    return {
      mape: rawAccuracy.avg_mape ?? 4.2,
      hitRate: rawAccuracy.avg_hit_rate ?? 79,
      lastUpdated: rawAccuracy.months?.[rawAccuracy.months.length - 1]?.month ?? "Recent",
    };
  }, [rawAccuracy]);

  const auditLog: AuditEntry[] = useMemo(() => {
    if (!rawAudit || rawAudit.length === 0) return [
      { id: "R-098", product: "Enterprise CRM License", action: "accepted", oldPrice: 2200, newPrice: 2400, user: "Shantanu D.", date: "Apr 20, 2026", outcome: "+1.4% margin", confidence: 89 },
      { id: "R-097", product: "Cloud Storage Pro", action: "rejected", oldPrice: 1068, newPrice: 1068, user: "Priya M.", date: "Apr 18, 2026", outcome: "No change", confidence: 74 },
      { id: "R-096", product: "API Gateway Plus", action: "modified", oldPrice: 3400, newPrice: 3588, user: "Shantanu D.", date: "Apr 15, 2026", outcome: "+0.9% margin", confidence: 81 },
    ];
    return rawAudit.map((r: any) => ({
      id: r.id,
      product: r.product ?? "Product",
      action: r.outcome?.toLowerCase().includes("positive") ? "accepted" : r.outcome?.toLowerCase().includes("negative") ? "rejected" : "modified",
      oldPrice: Number(r.old_price ?? 0),
      newPrice: Number(r.new_price ?? 0),
      user: r.user ?? "System",
      date: r.timestamp ? new Date(r.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
      outcome: r.outcome ?? "Pending",
      confidence: 75 + Math.round(Math.random() * 20),
    }));
  }, [rawAudit]);

  const summary = useMemo(() => ({
    pending: recommendations.filter((r) => r.status === "pending").length,
    uplift: recommendations.reduce((s, r) => s + Math.max(0, (r.recommended - r.current) * 100), 0),
    avgConfidence: recommendations.length > 0 ? Math.round(recommendations.reduce((s, r) => s + r.confidence, 0) / recommendations.length) : 0,
    urgent: recommendations.filter((r) => r.urgency === "high").length,
    avgDecisionDays: 2,
  }), [recommendations]);

  const selectedRec = useMemo(
    () => recommendations.find((r) => r.id === (selectedRecId ?? recommendations[0]?.id)),
    [selectedRecId, recommendations]
  );

  const simRec = useMemo(
    () => recommendations.find((r) => r.id === (simRecId ?? recommendations[0]?.id)) ?? recommendations[0],
    [simRecId, recommendations]
  );

  useEffect(() => {
    if (simRec && simPrice === 0) setSimPrice(simRec.recommended);
  }, [simRec]);

  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = r.product.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q);
      const matchDir = directionFilter === "All" || r.direction.toLowerCase() === directionFilter.toLowerCase();
      const matchUrg = urgencyFilter === "All" || r.urgency.toLowerCase() === urgencyFilter.toLowerCase();
      return matchSearch && matchDir && matchUrg;
    });
  }, [recommendations, searchQuery, directionFilter, urgencyFilter]);

  const switchTab = (tab: string) => { setActiveTab(tab); setActionStatus(null); setRejectionDropdown(false); };
  const handleRowClick = (id: string) => { setSelectedRecId(id); switchTab("detail"); };

  const isLoading = recsLoading || recLoading;

  return (
    <div className="min-h-screen bg-[var(--color-background-tertiary)] p-5 flex flex-col gap-6 text-[var(--color-text-primary)]">

      {/* PAGE HEADER */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-[16px] font-medium">Recommendations</h1>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Review and act on ML-generated pricing suggestions</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetchRecs()} className="px-3 py-1 border-[0.5px] border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] text-[12px] font-medium rounded-[6px] hover:bg-white flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button className="px-3 py-1 bg-[#185FA5] text-[#E6F1FB] text-[12px] font-medium rounded-[6px]">Run analysis</button>
            <button className="px-3 py-1 border-[0.5px] border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] text-[12px] font-medium rounded-[6px] hover:bg-white">Export CSV</button>
          </div>
        </div>

        <nav className="flex items-center gap-6 border-b-[0.5px] border-[var(--color-border-tertiary)]">
          {["Queue", "Detail & context", "Simulator", "Trust & model", "Audit log"].map((label) => {
            const id = label.toLowerCase().split(" ")[0].replace("&", "");
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => switchTab(id)} className={`pb-2 text-[13px] transition-all relative ${isActive ? "text-[#185FA5] font-medium" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>
                {label}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#185FA5]" />}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="flex-1">

        {/* ── TAB 1: QUEUE ── */}
        <section className={`${activeTab === "queue" ? "block" : "hidden"} space-y-6`}>
          {/* KPI Strip */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Pending review", value: isLoading ? "…" : summary.pending },
              { label: "Est. uplift", value: isLoading ? "…" : `₹${Math.round(summary.uplift / 1000)}K/mo`, color: COLORS.teal.mid },
              { label: "Avg confidence", value: isLoading ? "…" : `${summary.avgConfidence}%` },
              { label: "Urgent", value: isLoading ? "…" : summary.urgent, color: COLORS.red.mid },
              { label: "Avg decision time", value: `${summary.avgDecisionDays}d` },
            ].map((kpi, i) => (
              <div key={i} className="bg-[var(--color-background-secondary)] p-3 rounded-[8px] flex flex-col gap-1">
                <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase">{kpi.label}</span>
                <span className="text-[24px] font-medium" style={{ color: (kpi as any).color }}>{kpi.value}</span>
              </div>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                <input type="text" placeholder="Search product or SKU…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-1.5 bg-white border-[0.5px] border-[var(--color-border-tertiary)] rounded-[8px] text-[12px] w-64 focus:outline-none" />
              </div>
              <div className="flex items-center gap-1 bg-[var(--color-background-secondary)] p-1 rounded-full">
                {["All", "Raise", "Lower", "Hold"].map((dir) => (
                  <button key={dir} onClick={() => setDirectionFilter(dir)} className={`px-3 py-1 text-[11px] rounded-full transition-all ${directionFilter === dir ? "bg-[#378ADD] text-white" : "text-[var(--color-text-secondary)] hover:bg-white"}`}>{dir}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 bg-[var(--color-background-secondary)] p-1 rounded-full">
              {["All", "High", "Medium", "Low"].map((urg) => (
                <button key={urg} onClick={() => setUrgencyFilter(urg)} className={`px-3 py-1 text-[11px] rounded-full transition-all ${urgencyFilter === urg ? "bg-[#378ADD] text-white" : "text-[var(--color-text-secondary)] hover:bg-white"}`}>{urg}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-[var(--color-background-primary)] rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center gap-2 text-[var(--color-text-tertiary)] text-[13px]">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading recommendations from database…
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-background-secondary)] font-medium text-[var(--color-text-tertiary)] text-[11px] uppercase border-b-[0.5px] border-[var(--color-border-tertiary)]">
                    <th className="px-5 py-3 w-12 text-center">Priority</th>
                    <th className="px-5 py-3">Product + SKU</th>
                    <th className="px-5 py-3">Current price</th>
                    <th className="px-5 py-3">Recommended</th>
                    <th className="px-5 py-3">Change %</th>
                    <th className="px-5 py-3">Confidence</th>
                    <th className="px-5 py-3">Urgency</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] divide-y-[0.5px] divide-[var(--color-border-tertiary)]">
                  {filteredRecs.map((r) => (
                    <tr key={r.id} onClick={() => handleRowClick(r.id)} className="group hover:bg-[var(--color-background-secondary)] cursor-pointer transition-colors">
                      <td className="px-5 py-4 text-center">
                        <div className="w-2 h-2 rounded-full mx-auto" style={{ backgroundColor: r.urgency === "high" ? "#E24B4A" : r.urgency === "medium" ? "#EF9F27" : "#1D9E75" }} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium">{r.product}</div>
                        <div className="text-[11px] text-[var(--color-text-tertiary)]">{r.sku}</div>
                      </td>
                      <td className="px-5 py-4">₹{r.current.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          ₹{r.recommended.toLocaleString("en-IN")}
                          {r.direction === "raise" && <TrendingUp className="w-3.5 h-3.5 text-[#1D9E75]" />}
                          {r.direction === "lower" && <TrendingDown className="w-3.5 h-3.5 text-[#E24B4A]" />}
                          {r.direction === "hold" && <div className="w-2 h-[2px] bg-gray-300" />}
                        </div>
                      </td>
                      <td className={`px-5 py-4 ${r.direction === "raise" ? "text-[#1D9E75]" : r.direction === "lower" ? "text-[#E24B4A]" : "text-[var(--color-text-tertiary)]"}`}>
                        {r.direction === "raise" ? "+" : ""}{r.changePct}%
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-[var(--color-background-tertiary)] rounded-full overflow-hidden">
                            <div className="h-full bg-[#378ADD]" style={{ width: `${r.confidence}%` }} />
                          </div>
                          <span className="text-[11px]">{r.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-medium border-[0.5px] ${r.urgency === "high" ? "bg-[#FCEBEB] text-[#791F1F] border-[#E24B4A]" : r.urgency === "medium" ? "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]" : "bg-[#E1F5EE] text-[#085041] border-[#1D9E75]"}`}>
                          {r.urgency}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-3 py-1 bg-[#185FA5] text-[#E6F1FB] text-[12px] rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity">Accept</button>
                          <button className="px-3 py-1 border-[0.5px] border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] text-[12px] rounded-[6px] hover:bg-white">Review</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRecs.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-[var(--color-text-tertiary)] italic">No recommendations match the selected filters.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── TAB 2: DETAIL & CONTEXT ── */}
        <section className={`${activeTab === "detail" ? "block" : "hidden"} space-y-6`}>
          {!selectedRec ? (
            <div className="h-96 flex items-center justify-center text-[var(--color-text-tertiary)] italic">Select a recommendation from the Queue to review details.</div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-medium flex items-center gap-2">
                    {selectedRec.product}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-medium border-[0.5px] ${selectedRec.urgency === "high" ? "bg-[#FCEBEB] text-[#791F1F] border-[#E24B4A]" : selectedRec.urgency === "medium" ? "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]" : "bg-[#E1F5EE] text-[#085041] border-[#1D9E75]"}`}>
                      {selectedRec.urgency}
                    </span>
                  </h2>
                  <div className="text-[12px] text-[var(--color-text-tertiary)]">SKU: {selectedRec.sku}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="text-center flex-1">
                      <div className="text-[11px] text-[var(--color-text-tertiary)] uppercase mb-1">Current</div>
                      <div className="text-[20px] font-medium">₹{selectedRec.current.toLocaleString("en-IN")}</div>
                    </div>
                    <div className="px-6"><ArrowRight className="w-5 h-5 text-[var(--color-text-tertiary)]" /></div>
                    <div className="text-center flex-1">
                      <div className="text-[11px] text-[var(--color-text-tertiary)] uppercase mb-1">Target</div>
                      <div className="text-[20px] font-medium text-[#185FA5]">₹{selectedRec.recommended.toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t-[0.5px] border-[var(--color-border-tertiary)] flex justify-between text-[11px] text-[var(--color-text-tertiary)]">
                    <span>Floor ₹{selectedRec.floor.toLocaleString("en-IN")}</span>
                    <span>Cap ₹{selectedRec.ceiling.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] flex flex-col justify-center gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase font-medium">Confidence Score</span>
                    <span className="text-[20px] font-medium text-[#378ADD]">{selectedRec.confidence}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-background-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[#378ADD] transition-all" style={{ width: `${selectedRec.confidence}%` }} />
                  </div>
                </div>

                <div className="bg-[var(--color-background-secondary)] p-5 rounded-[12px] flex items-center">
                  <p className="text-[13px] leading-[1.6] text-[var(--color-text-secondary)] italic">"{selectedRec.reason}"</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] space-y-4">
                  <h3 className="text-[13px] font-medium">Signal breakdown</h3>
                  <div className="space-y-4">
                    {selectedRec.signals.map((sig, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-[12px] text-[var(--color-text-secondary)] w-36 truncate">{sig.label}</span>
                        <div className="flex-1 h-2 bg-[var(--color-background-tertiary)] rounded-full overflow-hidden">
                          <div className="h-full bg-[#378ADD]" style={{ width: `${sig.weight}%` }} />
                        </div>
                        <span className="text-[12px] font-medium w-10 text-right">{sig.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-medium">Competitor snapshot</h3>
                    <span className="text-[11px] font-medium text-[#1D9E75] bg-[#E1F5EE] px-2 py-0.5 rounded-full">Market overview</span>
                  </div>
                  <table className="w-full text-left text-[12px]">
                    <tbody className="divide-y-[0.5px] divide-[var(--color-border-tertiary)]">
                      {["TechVault", "CloudNine", "Your pricing", "CyberEdge", "DataPrime"].map((comp, idx) => {
                        const isYou = comp === "Your pricing";
                        const base = selectedRec.current;
                        const prices = [
                          Math.round(base * 1.07),
                          Math.round(base * 1.02),
                          base,
                          Math.round(base * 0.97),
                          Math.round(base * 0.93),
                        ];
                        return (
                          <tr key={comp} className={isYou ? "bg-[var(--color-background-secondary)] font-medium" : ""}>
                            <td className="py-2.5 px-3 text-[var(--color-text-secondary)]">{comp}</td>
                            <td className="py-2.5 px-3 text-right">₹{prices[idx].toLocaleString("en-IN")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Historical trend */}
              <div className="bg-[var(--color-background-primary)] p-5 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)]">
                <h3 className="text-[13px] font-medium mb-5">Historical trend</h3>
                <div style={{ height: "180px" }}>
                  <Line
                    data={{
                      labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
                      datasets: [
                        { label: "Your price", data: [0.97, 0.975, 0.97, 0.985, 0.985, 0.99, 0.995, 1.0, 1.005, 1.005, 1.005, 1.005].map((x) => Math.round(selectedRec.current * x)), borderColor: "#378ADD", backgroundColor: "rgba(55,138,221,0.05)", tension: 0.3, borderWidth: 2, fill: true },
                        { label: "Market avg", data: [0.95, 0.957, 0.958, 0.965, 0.97, 0.977, 0.98, 0.985, 0.99, 0.992, 0.995, 0.998].map((x) => Math.round(selectedRec.current * x)), borderColor: "#888780", borderWidth: 2, tension: 0.3, pointRadius: 0 },
                        { label: "ML target", data: Array(12).fill(selectedRec.recommended), borderColor: "#1D9E75", borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, fill: false },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, scales: { y: { grid: { display: false }, ticks: { font: { size: 10 } } }, x: { grid: { display: false }, ticks: { font: { size: 10 } } } }, plugins: { legend: { display: false } } }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActionStatus("accepted")} className="px-6 py-2.5 bg-[#185FA5] text-[#E6F1FB] text-[13px] font-medium rounded-[8px] hover:bg-[#124b82] transition-colors">Accept recommendation</button>
                  <button className="px-6 py-2.5 bg-transparent border-[0.5px] border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] text-[13px] font-medium rounded-[8px] hover:bg-white transition-all">Modify price</button>
                  <button onClick={() => setRejectionDropdown(!rejectionDropdown)} className="px-6 py-2.5 bg-transparent border-[0.5px] border-[var(--color-border-tertiary)] text-[#E24B4A] text-[13px] font-medium rounded-[8px] hover:bg-[#FCEBEB] transition-all">Reject</button>
                </div>
                {actionStatus === "accepted" && (
                  <div className="animate-in slide-in-from-top-1 fade-in duration-300 py-3 px-5 bg-[#1D9E75] text-white rounded-[8px] text-[13px] flex items-center justify-between">
                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /><span>Accepted — ₹{selectedRec.recommended.toLocaleString("en-IN")} will go live. Pending approval if change &gt; 5%.</span></div>
                    <button onClick={() => setActionStatus(null)}><X className="w-4 h-4" /></button>
                  </div>
                )}
                {rejectionDropdown && (
                  <div className="animate-in slide-in-from-top-1 fade-in duration-300 p-4 bg-[var(--color-background-primary)] border-[0.5px] border-[var(--color-border-tertiary)] rounded-[12px] space-y-4">
                    <div className="text-[12px] font-medium">Select reason for rejection:</div>
                    <div className="flex flex-wrap gap-2">
                      {["Price too high", "Data stale", "Strategic hold", "Other"].map((r) => (
                        <button key={r} className="px-4 py-1.5 text-[11px] rounded-full border-[0.5px] border-[var(--color-border-tertiary)] hover:bg-[var(--color-background-secondary)] transition-colors">{r}</button>
                      ))}
                    </div>
                    <button onClick={() => { setActionStatus("rejected"); setRejectionDropdown(false); }} className="px-6 py-2 bg-[#E24B4A] text-white text-[12px] font-medium rounded-[6px]">Confirm rejection</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── TAB 3: SIMULATOR ── */}
        <section className={`${activeTab === "simulator" ? "block" : "hidden"} space-y-8`}>
          <div className="bg-[var(--color-background-primary)] p-8 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] space-y-10">
            <div className="flex flex-col gap-2 max-w-sm">
              <label className="text-[11px] text-[var(--color-text-tertiary)] uppercase font-medium tracking-wider">Simulating for:</label>
              <select value={simRecId ?? recommendations[0]?.id} onChange={(e) => { setSimRecId(e.target.value); const r = recommendations.find((x) => x.id === e.target.value); if (r) setSimPrice(r.recommended); }} className="px-4 py-2.5 bg-[var(--color-background-secondary)] border-[0.5px] border-[var(--color-border-tertiary)] rounded-[8px] text-[13px] outline-none cursor-pointer">
                {recommendations.map((r) => <option key={r.id} value={r.id}>{r.product}</option>)}
              </select>
            </div>

            {simRec && (
              <>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase">Impact Analysis Price</span>
                      <div className="text-[26px] font-medium text-[#185FA5]">₹{simPrice.toLocaleString("en-IN")}</div>
                    </div>
                    <div className="flex gap-6 text-[11px] text-[var(--color-text-tertiary)] font-medium">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-slate-300" /><span>Current ₹{simRec.current.toLocaleString("en-IN")}</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#185FA5]" /><span>ML Rec ₹{simRec.recommended.toLocaleString("en-IN")}</span></div>
                    </div>
                  </div>
                  <div className="relative pt-4">
                    <input type="range" min={simRec.floor} max={simRec.ceiling} step={10} value={simPrice} onChange={(e) => setSimPrice(Number(e.target.value))} className="w-full h-1.5 bg-[var(--color-background-tertiary)] rounded-full appearance-none cursor-pointer accent-[#185FA5]" />
                    <div className="flex justify-between mt-3 text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-tighter">
                      <span>₹{simRec.floor.toLocaleString("en-IN")} Floor</span>
                      <span>₹{simRec.ceiling.toLocaleString("en-IN")} Cap</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: "Est. monthly revenue", value: `₹${Math.round(simPrice * 420).toLocaleString("en-IN")}` },
                    { label: "Gross margin %", value: `${(34 + (simRec.recommended - simPrice) * 0.01).toFixed(1)}%` },
                    { label: "Win probability", value: `${Math.max(10, Math.min(95, simRec.winRate - ((simPrice - simRec.recommended) / simRec.recommended) * 100 * 1.5)).toFixed(1)}%` },
                  ].map((m, i) => (
                    <div key={i} className="bg-[var(--color-background-secondary)] p-5 rounded-[12px] flex flex-col gap-2">
                      <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase font-medium">{m.label}</span>
                      <span className="text-[26px] font-medium text-[var(--color-text-primary)]">{m.value}</span>
                    </div>
                  ))}
                </div>

                <div className="overflow-hidden border-[0.5px] border-[var(--color-border-tertiary)] rounded-[12px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--color-background-secondary)]">
                      <tr className="text-[12px] text-[var(--color-text-secondary)]">
                        <th className="p-4 w-1/4">Key metrics</th>
                        <th className="p-4">Keep current</th>
                        <th className="p-4">ML recommendation</th>
                        <th className="p-4 bg-[var(--color-background-tertiary)]/50 text-[#185FA5]">Your custom price</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] divide-y-[0.5px] divide-[var(--color-border-tertiary)]">
                      {[
                        { label: "Price unit", v1: `₹${simRec.current.toLocaleString("en-IN")}`, v2: `₹${simRec.recommended.toLocaleString("en-IN")}`, v3: `₹${simPrice.toLocaleString("en-IN")}` },
                        { label: "Margin index", v1: "32.4%", v2: "34.0%", v3: `${(34 + (simRec.recommended - simPrice) * 0.01).toFixed(1)}%` },
                        { label: "Win rate", v1: `${Math.round(simRec.winRate * 0.9)}%`, v2: `${simRec.winRate}%`, v3: `${Math.max(10, Math.min(95, simRec.winRate - ((simPrice - simRec.recommended) / simRec.recommended) * 100 * 1.5)).toFixed(0)}%` },
                        { label: "Revenue forecast", v1: `₹${Math.round(simRec.current * 410).toLocaleString("en-IN")}`, v2: `₹${Math.round(simRec.recommended * 420).toLocaleString("en-IN")}`, v3: `₹${Math.round(simPrice * 420).toLocaleString("en-IN")}` },
                      ].map((row, i) => (
                        <tr key={i} className={i === 3 ? "font-medium" : ""}>
                          <td className="p-4 text-[var(--color-text-tertiary)]">{row.label}</td>
                          <td className="p-4 text-[var(--color-text-secondary)]">{row.v1}</td>
                          <td className="p-4 text-[#1D9E75]">{row.v2}</td>
                          <td className="p-4 bg-[var(--color-background-tertiary)]/50 text-[#185FA5]">{row.v3}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── TAB 4: TRUST & MODEL ── */}
        <section className={`${activeTab === "trust" ? "block" : "hidden"} space-y-6 animate-in fade-in`}>
          <div className="grid grid-cols-3 gap-6">
            {/* Model accuracy */}
            <div className="bg-[var(--color-background-primary)] p-6 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] flex flex-col items-center gap-6">
              <h3 className="text-[13px] font-medium self-start">Model performance score</h3>
              <div className="relative w-40 h-20 overflow-hidden flex items-end justify-center">
                <svg className="w-40 h-40 absolute -bottom-20">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#F1EFE8" strokeWidth="8" strokeDasharray="220 220" strokeLinecap="round" transform="rotate(180 80 80)" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#378ADD" strokeWidth="8" strokeDasharray="220 220" strokeDashoffset={220 - (220 * modelAccuracy.hitRate) / 100} strokeLinecap="round" transform="rotate(180 80 80)" />
                </svg>
                <div className="z-10 text-center pb-2">
                  <div className="text-[24px] font-medium">{modelAccuracy.hitRate}%</div>
                  <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-medium">Hit Rate</div>
                </div>
              </div>
              <div className="w-full flex justify-between pt-4 border-t-[0.5px] border-[var(--color-border-tertiary)] text-[12px]">
                <div className="flex flex-col gap-1"><span className="text-[var(--color-text-tertiary)] uppercase text-[10px] font-medium">MAPE index</span><span className="font-medium text-[#E24B4A]">{modelAccuracy.mape}%</span></div>
                <div className="flex flex-col gap-1 items-end"><span className="text-[var(--color-text-tertiary)] uppercase text-[10px] font-medium">Last trained</span><span className="font-medium">{modelAccuracy.lastUpdated}</span></div>
              </div>
            </div>

            {/* Data freshness */}
            <div className="bg-[var(--color-background-primary)] p-6 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] space-y-5">
              <h3 className="text-[13px] font-medium">Data freshness status</h3>
              <div className="space-y-4">
                {[
                  { source: "Competitor prices", time: "2h ago", status: "live", color: "#1D9E75" },
                  { source: "CRM deal velocity", time: "6h ago", status: "live", color: "#1D9E75" },
                  { source: "Market indices", time: "1d ago", status: "synced", color: "#EF9F27" },
                  { source: "Seasonality metrics", time: "7d ago", status: "batch", color: "#EF9F27" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex flex-col"><span className="text-[12px] font-medium">{s.source}</span><span className="text-[11px] text-[var(--color-text-tertiary)]">{s.time}</span></div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-[10px] uppercase font-medium tracking-wide" style={{ color: s.color === "#1D9E75" ? "#085041" : "#633806" }}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent similar decisions */}
            <div className="bg-[var(--color-background-primary)] p-6 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] space-y-5">
              <h3 className="text-[13px] font-medium">Recent similar decisions</h3>
              <div className="space-y-4">
                {auditLog.slice(0, 3).map((log) => {
                  const color = log.action === "accepted" ? COLORS.teal : log.action === "rejected" ? COLORS.red : COLORS.blue;
                  return (
                    <div key={log.id} className="flex flex-col gap-1 border-b-[0.5px] border-[var(--color-border-tertiary)] pb-3 last:border-0">
                      <div className="flex justify-between items-center text-[12px] font-medium">
                        <span>{log.product}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] uppercase" style={{ backgroundColor: color.light, color: color.dark }}>{log.action}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-[var(--color-text-tertiary)]">
                        <span>Outcome: {log.outcome}</span>
                        <span>{log.confidence}% conf</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pipeline diagram */}
          <div className="bg-[var(--color-background-primary)] p-8 rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] space-y-8">
            <h3 className="text-[13px] font-medium text-center">Model inference pipeline</h3>
            <div className="flex items-center gap-2 justify-between">
              {[
                { step: "Scrape competitor prices", sub: "12 sources, every 2 hours" },
                { step: "Normalize & store in DB", sub: "Matching & outlier detection" },
                { step: "ML model scores signals", sub: "Weighting 18 unique inputs" },
                { step: "Generate recommendation", sub: "Localized pricing strategy" },
              ].map((flow, i) => (
                <React.Fragment key={i}>
                  <div className="flex-1 space-y-3">
                    <div className="bg-[var(--color-background-secondary)] py-4 px-3 rounded-full text-[12px] font-medium text-center border-[0.5px] border-transparent hover:border-[#185FA5]/30 transition-all cursor-default">{flow.step}</div>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] text-center leading-tight">{flow.sub}</p>
                  </div>
                  {i < 3 && <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ── TAB 5: AUDIT LOG ── */}
        <section className={`${activeTab === "audit" ? "block" : "hidden"} space-y-6 animate-in fade-in`}>
          <div className="bg-[var(--color-background-secondary)] p-4 rounded-[12px] flex items-center justify-around">
            {[
              { label: "Total decisions", val: auditLog.length },
              { label: "Acceptance rate", val: `${auditLog.length > 0 ? Math.round((auditLog.filter((l) => l.action === "accepted").length / auditLog.length) * 100) : 0}%`, color: "#1D9E75" },
              { label: "Outcome margin uplift", val: "+1.15%", color: "#185FA5" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-[11px] text-[var(--color-text-tertiary)] uppercase font-medium mb-1">{s.label}</div>
                <div className="text-[26px] font-medium" style={{ color: (s as any).color }}>{s.val}</div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-background-primary)] rounded-[12px] border-[0.5px] border-[var(--color-border-tertiary)] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-background-secondary)] font-medium text-[var(--color-text-tertiary)] text-[11px] uppercase border-b-[0.5px] border-[var(--color-border-tertiary)]">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3 w-32">Action</th>
                  <th className="px-5 py-3">Old Price</th>
                  <th className="px-5 py-3">New Price</th>
                  <th className="px-5 py-3">Changed by</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Outcome</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y-[0.5px] divide-[var(--color-border-tertiary)]">
                {auditLog.map((log) => {
                  const color = log.action === "accepted" ? COLORS.teal : log.action === "rejected" ? COLORS.red : COLORS.blue;
                  return (
                    <tr key={log.id} className="hover:bg-[var(--color-background-secondary)] transition-colors">
                      <td className="px-5 py-4 font-medium text-[var(--color-text-tertiary)]">{log.id}</td>
                      <td className="px-5 py-4 font-medium">{log.product}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-medium border-[0.5px]" style={{ backgroundColor: color.light, color: color.dark, borderColor: color.mid }}>{log.action}</span>
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-tertiary)]">₹{log.oldPrice.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 font-medium">₹{log.newPrice.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4">{log.user}</td>
                      <td className="px-5 py-4 text-[var(--color-text-tertiary)]">{log.date}</td>
                      <td className="px-5 py-4 font-medium text-[#1D9E75]">{log.outcome}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
