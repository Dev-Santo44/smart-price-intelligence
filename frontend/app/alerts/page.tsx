"use client";
import React, { useState, useEffect } from "react";
import {
  Bell, CheckCircle, AlertTriangle, Info, XCircle,
  X, RefreshCw, Filter, Clock, TrendingDown, TrendingUp, Shield
} from "lucide-react";

type Alert = {
  id: string;
  rule_name: string;
  severity: "high" | "medium" | "low";
  message: string;
  timestamp: string;
  read: boolean;
};

const DEMO_ALERTS: Alert[] = [
  { id: "AE-001", rule_name: "Competitor price drop > 5%", severity: "high", message: "AlphaCo dropped BT Mechanical Keyboard Elite from $76.00 to $69.00 — a 9.2% cut. 4 SMB deals lost this week.", timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), read: false },
  { id: "AE-002", rule_name: "Your margin below 18%", severity: "high", message: "Wireless Headphones X1 margin fell to 14.2% — 3.8% below the 18% target. Recommend reviewing pricing.", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), read: false },
  { id: "AE-003", rule_name: "Win rate drops below 50%", severity: "medium", message: "Smart Speaker Plus win rate in SMB segment is now 48% — below 50% threshold for the first time this quarter.", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), read: false },
  { id: "AE-004", rule_name: "Competitor price drop > 5%", severity: "medium", message: "3 competitors dropped Smart Speaker Plus below $145. Market avg fell from $151 to $142.30 in 7 days.", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), read: true },
  { id: "AE-005", rule_name: "Data stale — no scrape in 24h", severity: "low", message: "PrimeSys scraper returned no data for 26 hours. Data may be stale for Headphones X1 and Earbuds.", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), read: true },
  { id: "AE-006", rule_name: "Recommendation confidence below 70%", severity: "low", message: "BT Keyboard Elite recommendation confidence is 71% — just above threshold. Review signal quality before acting.", timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), read: true },
];

const ALERT_RULES = [
  { id: "AR-001", name: "Competitor price drop > 5%", condition: "scraped_price_change_pct < -5", channel: "in-app", active: true },
  { id: "AR-002", name: "Your margin below 18%", condition: "product_margin_pct < 18", channel: "in-app", active: true },
  { id: "AR-003", name: "Win rate drops below 50%", condition: "win_rate_30d < 50", channel: "email", active: true },
  { id: "AR-004", name: "Recommendation confidence < 70%", condition: "recommendation_confidence < 70", channel: "in-app", active: true },
  { id: "AR-005", name: "Data stale — no scrape in 24h", condition: "last_scrape_age_hours > 24", channel: "in-app", active: true },
  { id: "AR-006", name: "Price index vs market > 115", condition: "price_index > 115", channel: "email", active: false },
];

function severityIcon(s: string) {
  if (s === "high")   return <XCircle className="w-4 h-4 text-red-500" />;
  if (s === "medium") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <Info className="w-4 h-4 text-blue-400" />;
}
function severityBg(s: string) {
  if (s === "high")   return "border-l-red-500 bg-red-50 dark:bg-red-950/30";
  if (s === "medium") return "border-l-amber-500 bg-amber-50 dark:bg-amber-950/30";
  return "border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/20";
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [filter, setFilter] = useState<"all" | "unread" | "high" | "medium" | "low">("all");
  const [rules, setRules] = useState(ALERT_RULES);

  const filtered = alerts.filter(a => {
    if (filter === "unread") return !a.read;
    if (filter === "high" || filter === "medium" || filter === "low") return a.severity === filter;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  function markRead(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }
  function markAllRead() {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }
  function dismiss(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-500" /> Alerts &amp; Monitoring
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time alerts for competitor moves, margin breaches, and model signals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <CheckCircle className="w-4 h-4" /> Mark all read
            </button>
          )}
          <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: alerts.length, icon: Bell, color: "text-slate-600 bg-slate-100" },
          { label: "Unread", value: unreadCount, icon: AlertTriangle, color: "text-red-600 bg-red-100" },
          { label: "High Severity", value: alerts.filter(a => a.severity === "high").length, icon: XCircle, color: "text-red-500 bg-red-50" },
          { label: "Active Rules", value: rules.filter(r => r.active).length, icon: Shield, color: "text-indigo-600 bg-indigo-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alert Feed */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            {/* Filter tabs */}
            <div className="flex items-center gap-1 p-4 border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
              {(["all", "unread", "high", "medium", "low"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    filter === f
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {f} {f === "unread" && unreadCount > 0 ? `(${unreadCount})` : ""}
                </button>
              ))}
            </div>

            {/* Alert list */}
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[540px] overflow-y-auto">
              {filtered.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  No alerts matching this filter.
                </div>
              )}
              {filtered.map(alert => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 border-l-4 transition-all ${severityBg(alert.severity)} ${!alert.read ? "font-medium" : "opacity-70"}`}
                >
                  <div className="mt-0.5 shrink-0">{severityIcon(alert.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-0.5">{alert.rule_name}</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" /> {timeAgo(alert.timestamp)}
                      </span>
                      {!alert.read && (
                        <button onClick={() => markRead(alert.id)} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => dismiss(alert.id)} className="shrink-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Rules */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" /> Alert Rules
            </h2>
            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{rule.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{rule.condition}</p>
                    <span className="inline-block mt-1 text-[10px] bg-slate-200 dark:bg-slate-700 rounded px-1.5 py-0.5 text-slate-500">
                      {rule.channel}
                    </span>
                  </div>
                  <button
                    onClick={() => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r))}
                    className={`shrink-0 w-9 h-5 rounded-full transition-colors ${rule.active ? "bg-indigo-500" : "bg-slate-300"} relative`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${rule.active ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
              + Add New Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
