"use client";
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AnalyticsProvider } from "@/context/AnalyticsContext";

// ① Command Bar
import CommandBar from "./components/CommandBar";
// ② KPI Row
import SnapshotKPIs from "./components/SnapshotKPIs";
// ③ Market Intelligence
import CompetitorHeatmap from "./components/CompetitorHeatmap";
import MarketDistribution from "./components/MarketDistribution";
import PriceChangeTracker from "./components/PriceChangeTracker";
import FeaturePriceMatrix from "./components/FeaturePriceMatrix";
// ④ Historical Analysis
import PriceTrendChart from "./components/PriceTrendChart";
import ElasticityChart from "./components/ElasticityChart";
import WinLossChart from "./components/WinLossChart";
import SeasonalityChart from "./components/SeasonalityChart";
import AuditLog from "./components/AuditLog";
// ⑤ ML Model Insights
import RecommendationCard from "./components/RecommendationCard";
import FeatureImportanceChart from "./components/FeatureImportanceChart";
import ScenarioSimulator from "./components/ScenarioSimulator";
import SegmentTable from "./components/SegmentTable";
import ModelAccuracy from "./components/ModelAccuracy";
// ⑥ Plan Builder
import TierBuilder from "./components/TierBuilder";
import DiscountRules from "./components/DiscountRules";
import RevenueForecast from "./components/RevenueForecast";
import ApprovalWorkflow from "./components/ApprovalWorkflow";
import PlanComparison from "./components/PlanComparison";
// ⑦ Alerts & Monitoring
import AlertRules from "./components/AlertRules";
import AlertFeed from "./components/AlertFeed";
import DataFreshness from "./components/DataFreshness";

/* ── Pipeline steps ── */
const PIPELINE = ["Scrape", "Store", "ML Model", "Predict & Recommend", "Plan Builder"];

/* ── Tab definitions ── */
const TABS = [
  { id: "market",     label: "Market Intelligence",  num: "③" },
  { id: "historical", label: "Historical Analysis",   num: "④" },
  { id: "ml",         label: "ML Insights",           num: "⑤" },
  { id: "plan",       label: "Plan Builder",          num: "⑥" },
  { id: "alerts",     label: "Alerts & Monitoring",   num: "⑦" },
] as const;

/* ── Section header ── */
function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 mt-2">
      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
        {number}
      </span>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
        {title}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  Main Page                                                */
/* ══════════════════════════════════════════════════════════ */
export default function PricingAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<string>("market");

  return (
    <AnalyticsProvider>
      <div className="min-h-screen bg-[var(--color-background-tertiary)] dark:bg-slate-950">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-5 flex flex-col gap-5">

          {/* ⓪ PIPELINE INDICATOR */}
          <div className="flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-5 py-2.5 shadow-sm self-center select-none">
            {PIPELINE.map((step, i) => {
              const isActive = (activeTab === "market" && i <= 1) ||
                               (activeTab === "ml" && i === 2) ||
                               (activeTab === "plan" && i >= 3);
              return (
                <React.Fragment key={step}>
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300
                      ${isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                      }`}
                  >
                    {step}
                  </span>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ① COMMAND BAR */}
          <section>
            <SectionHeader number="1" title="Command Bar" />
            <CommandBar />
          </section>

          {/* ② KPI SNAPSHOT ROW */}
          <section>
            <SnapshotKPIs />
          </section>

          {/* ── SUB-NAVIGATION ── */}
          <nav className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 relative px-3 py-2.5 text-[12px] font-semibold rounded-lg transition-all duration-200
                  ${activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* ── DYNAMIC CONTENT ── */}
          <main className="pb-10">

            {/* ③ MARKET INTELLIGENCE */}
            {activeTab === "market" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SectionHeader number="3" title="Market Intelligence — Scraped Data" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7">
                    <CompetitorHeatmap />
                  </div>
                  <div className="lg:col-span-5">
                    <MarketDistribution />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PriceChangeTracker />
                  <FeaturePriceMatrix />
                </div>
              </div>
            )}

            {/* ④ HISTORICAL ANALYSIS */}
            {activeTab === "historical" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SectionHeader number="4" title="Historical Analysis" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7">
                    <PriceTrendChart />
                  </div>
                  <div className="lg:col-span-5">
                    <ElasticityChart />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <WinLossChart />
                  <SeasonalityChart />
                  <AuditLog />
                </div>
              </div>
            )}

            {/* ⑤ ML MODEL INSIGHTS */}
            {activeTab === "ml" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SectionHeader number="5" title="ML Model Insights" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <RecommendationCard />
                  <FeatureImportanceChart />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
                    <ScenarioSimulator />
                  </div>
                  <div className="md:col-span-5">
                    <SegmentTable />
                  </div>
                  <div className="md:col-span-3">
                    <ModelAccuracy />
                  </div>
                </div>
              </div>
            )}

            {/* ⑥ PLAN BUILDER */}
            {activeTab === "plan" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SectionHeader number="6" title="Plan Builder" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TierBuilder />
                  <DiscountRules />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <RevenueForecast />
                  <ApprovalWorkflow />
                  <PlanComparison />
                </div>
              </div>
            )}

            {/* ⑦ ALERTS & MONITORING */}
            {activeTab === "alerts" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SectionHeader number="7" title="Alerts & Monitoring" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AlertRules />
                  <AlertFeed />
                  <DataFreshness />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AnalyticsProvider>
  );
}
