// app/api/seed/route.ts
// Browser-callable seed endpoint — POST /api/seed
// Only available in development. In production, protect with a secret token.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

// ─── Canonical product & competitor data ─────────────────────────────────────
const PRODUCTS = [
  { product_id: "P-1001", name: "Enterprise CRM License", your_price: 2400, category: "Software",       sku: "CRM-ENT-01" },
  { product_id: "P-1002", name: "Cloud Storage Pro",       your_price: 1068, category: "Infrastructure", sku: "CSP-PRO-02" },
  { product_id: "P-1003", name: "API Gateway Plus",        your_price: 3588, category: "Infrastructure", sku: "API-GW-03"  },
  { product_id: "P-1004", name: "Data Analytics Suite",    your_price: 5988, category: "Analytics",      sku: "DAS-PRO-04" },
  { product_id: "P-1005", name: "Security Shield Pro",     your_price: 2388, category: "Security",       sku: "SEC-SHP-05" },
];

const COMPETITORS = [
  { id: "C-01", name: "TechVault" },
  { id: "C-02", name: "CloudNine" },
  { id: "C-03", name: "DataPrime" },
  { id: "C-04", name: "CyberEdge" },
  { id: "C-05", name: "InnoSoft"  },
];

const RECOMMENDATIONS = [
  { product_id: "P-1001", product_name: "Enterprise CRM License", segment: "Enterprise",  region: "North America", current_price: 2400, recommended_price: 2580, floor_price: 2100, ceiling_price: 2800, confidence: 0.92, impact: 7.5,  status: "pending", rationale: "TechVault raised Enterprise CRM price by 9%. Demand stable. Margin 4% below target. Recommend 7.5% increase." },
  { product_id: "P-1002", product_name: "Cloud Storage Pro",       segment: "SMB",         region: "North America", current_price: 1068, recommended_price:  998, floor_price:  920, ceiling_price: 1150, confidence: 0.78, impact: -6.6, status: "pending", rationale: "3 competitors dropped below ₹1,000. Win rate fell 12% in last 30 days. Lower to recover SMB deal flow." },
  { product_id: "P-1003", product_name: "API Gateway Plus",        segment: "Mid-Market",  region: "EMEA",          current_price: 3588, recommended_price: 3588, floor_price: 3200, ceiling_price: 3900, confidence: 0.88, impact: 0,    status: "pending", rationale: "Market stable. Margin healthy at 22%. No competitor movement in last 90 days. Hold current price." },
  { product_id: "P-1004", product_name: "Data Analytics Suite",    segment: "Enterprise",  region: "North America", current_price: 5988, recommended_price: 6200, floor_price: 5500, ceiling_price: 6800, confidence: 0.83, impact: 3.5,  status: "pending", rationale: "Premium segment demand up 18%. Only 1 competitor (DataPrime) in this price bracket. Recommend 3.5% increase." },
  { product_id: "P-1005", product_name: "Security Shield Pro",     segment: "SMB",         region: "APAC",          current_price: 2388, recommended_price: 2200, floor_price: 2100, ceiling_price: 2600, confidence: 0.71, impact: -7.9, status: "pending", rationale: "InnoSoft undercut by ₹320. Losing SMB deals consistently for 60 days. Lower price to restore win rate." },
];

const AUDIT_LOG = [
  { user_name: "Shantanu D.", product_name: "Enterprise CRM License", old_price: 2200, new_price: 2400, change_pct:  9.1, outcome: "+1.4% margin", rationale: "ML recommendation accepted — competitor uplift",         timestamp: "2026-04-20T10:00:00Z" },
  { user_name: "Priya M.",    product_name: "Cloud Storage Pro",       old_price: 1068, new_price: 1068, change_pct:  0.0, outcome: "No change",     rationale: "Rejected — awaiting Q2 review",                         timestamp: "2026-04-18T14:30:00Z" },
  { user_name: "Shantanu D.", product_name: "API Gateway Plus",        old_price: 3400, new_price: 3588, change_pct:  5.5, outcome: "+0.9% margin", rationale: "Modified — strategic pricing with new feature launch",   timestamp: "2026-04-15T09:00:00Z" },
  { user_name: "Raj P.",      product_name: "Data Analytics Suite",    old_price: 5600, new_price: 5988, change_pct:  6.9, outcome: "+2.1% margin", rationale: "ML recommendation accepted — enterprise demand surge",    timestamp: "2026-04-10T11:15:00Z" },
  { user_name: "Admin Bot",   product_name: "Security Shield Pro",     old_price: 2500, new_price: 2388, change_pct: -4.5, outcome: "Neutral",       rationale: "Auto-match competitor floor price",                      timestamp: "2026-04-08T08:00:00Z" },
];

const MODEL_ACCURACY = [
  { month: "May-25", mape: 7.2, hit_rate: 74.0, predictions_count: 38 },
  { month: "Jun-25", mape: 6.8, hit_rate: 75.5, predictions_count: 42 },
  { month: "Jul-25", mape: 6.1, hit_rate: 77.0, predictions_count: 45 },
  { month: "Aug-25", mape: 5.9, hit_rate: 78.2, predictions_count: 50 },
  { month: "Sep-25", mape: 5.5, hit_rate: 79.0, predictions_count: 55 },
  { month: "Oct-25", mape: 5.2, hit_rate: 80.1, predictions_count: 58 },
  { month: "Nov-25", mape: 4.9, hit_rate: 81.3, predictions_count: 62 },
  { month: "Dec-25", mape: 4.7, hit_rate: 82.0, predictions_count: 65 },
  { month: "Jan-26", mape: 4.5, hit_rate: 82.8, predictions_count: 70 },
  { month: "Feb-26", mape: 4.3, hit_rate: 83.5, predictions_count: 75 },
  { month: "Mar-26", mape: 4.2, hit_rate: 84.0, predictions_count: 80 },
  { month: "Apr-26", mape: 4.2, hit_rate: 79.0, predictions_count: 55 },
];

const ALERT_RULES = [
  { id: "AR-1", name: "Competitor Price Drop", condition: "Any competitor drops price > 5%",        channel: "in-app", active: true,  created_at: "2025-09-15T10:00:00Z" },
  { id: "AR-2", name: "Margin Below Target",   condition: "Margin dips below 15%",                  channel: "in-app", active: true,  created_at: "2025-09-20T14:00:00Z" },
  { id: "AR-3", name: "ML Confidence Drop",    condition: "Model confidence falls below 70%",        channel: "in-app", active: false, created_at: "2025-10-01T09:00:00Z" },
  { id: "AR-4", name: "Scrape Failure",        condition: "Any source fails to scrape for > 24h",    channel: "in-app", active: true,  created_at: "2025-10-05T11:00:00Z" },
  { id: "AR-5", name: "Win Rate Drop",         condition: "Win rate drops >10% in a 30-day window",  channel: "in-app", active: true,  created_at: "2025-11-01T08:00:00Z" },
];

function buildAlertEvents(): any[] {
  const n = Date.now();
  return [
    { id: "AE-1", rule_name: "Competitor Price Drop", severity: "high",   message: "TechVault dropped Enterprise CRM price by 12%",            timestamp: new Date(n -  2*3600000).toISOString(), read: false },
    { id: "AE-2", rule_name: "Margin Below Target",   severity: "medium", message: "Cloud Storage Pro margin at 13.2% (below 15% target)",     timestamp: new Date(n -  8*3600000).toISOString(), read: false },
    { id: "AE-3", rule_name: "Competitor Price Drop", severity: "high",   message: "DataPrime reduced API Gateway pricing by 7.5%",            timestamp: new Date(n - 24*3600000).toISOString(), read: true  },
    { id: "AE-4", rule_name: "Scrape Failure",        severity: "low",    message: "CyberEdge scraper returned 403 — retrying",               timestamp: new Date(n - 36*3600000).toISOString(), read: true  },
    { id: "AE-5", rule_name: "ML Confidence Drop",    severity: "medium", message: "Model confidence for Security Shield Pro at 62%",          timestamp: new Date(n - 48*3600000).toISOString(), read: true  },
    { id: "AE-6", rule_name: "Win Rate Drop",         severity: "high",   message: "Security Shield Pro SMB win rate dropped from 71% to 48%", timestamp: new Date(n - 72*3600000).toISOString(), read: true  },
  ];
}

function buildScrapedData(): any[] {
  const n = Date.now();
  const mults: Record<string, number> = { "C-01": 1.07, "C-02": 1.02, "C-03": 0.97, "C-04": 0.93, "C-05": 0.90 };
  const rows: any[] = [];
  for (const prod of PRODUCTS) {
    for (const comp of COMPETITORS) {
      for (let i = 0; i < 4; i++) {
        const jitter = 0.98 + Math.random() * 0.04;
        rows.push({
          product_id:    prod.product_id,
          competitor_id: comp.id,
          price:         Math.round(prod.your_price * (mults[comp.id] ?? 1.0) * jitter),
          created_at:    new Date(n - i * 7 * 86400000).toISOString(),
        });
      }
    }
  }
  return rows;
}

function buildRecentEvents(): any[] {
  const n = Date.now();
  return [
    { product_id: "P-1001", product_name: "Enterprise CRM License", competitor: "TechVault", old_price: 2160, new_price: 2400, change_pct:  11.1, timestamp: new Date(n -  2*3600000).toISOString() },
    { product_id: "P-1002", product_name: "Cloud Storage Pro",       competitor: "CloudNine", old_price: 1100, new_price: 1020, change_pct:  -7.3, timestamp: new Date(n -  6*3600000).toISOString() },
    { product_id: "P-1003", product_name: "API Gateway Plus",        competitor: "DataPrime", old_price: 3800, new_price: 3520, change_pct:  -7.4, timestamp: new Date(n - 14*3600000).toISOString() },
    { product_id: "P-1004", product_name: "Data Analytics Suite",    competitor: "CyberEdge", old_price: 5600, new_price: 5900, change_pct:   5.4, timestamp: new Date(n - 22*3600000).toISOString() },
    { product_id: "P-1005", product_name: "Security Shield Pro",     competitor: "InnoSoft",  old_price: 2600, new_price: 2100, change_pct: -19.2, timestamp: new Date(n - 30*3600000).toISOString() },
    { product_id: "P-1001", product_name: "Enterprise CRM License", competitor: "InnoSoft",  old_price: 2300, new_price: 2450, change_pct:   6.5, timestamp: new Date(n - 48*3600000).toISOString() },
    { product_id: "P-1002", product_name: "Cloud Storage Pro",       competitor: "CyberEdge", old_price:  980, new_price:  940, change_pct:  -4.1, timestamp: new Date(n - 54*3600000).toISOString() },
  ];
}

// ─── Helper ───────────────────────────────────────────────────────────────────
async function upsertTable(table: string, rows: any[], conflict?: string, clearFirst = true) {
  if (clearFirst) {
    const { error: delErr } = await supabaseAdmin.from(table).delete().neq("id", "NEVER_EXISTS_PLACEHOLDER_9999");
    if (delErr && !delErr.message.includes("column") && !delErr.message.includes("does not exist")) {
      console.warn(`[seed] clear ${table}:`, delErr.message);
    }
  }
  if (conflict) {
    return supabaseAdmin.from(table).upsert(rows, { onConflict: conflict });
  }
  return supabaseAdmin.from(table).insert(rows);
}

// ─── POST /api/seed ───────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const results: Record<string, { ok: boolean; count?: number; error?: string }> = {};

  try {
    // 1. Products
    const { error: e1 } = await supabaseAdmin.from("products").upsert(PRODUCTS, { onConflict: "product_id" });
    results.products = e1 ? { ok: false, error: e1.message } : { ok: true, count: PRODUCTS.length };

    // 2. Competitors
    const { error: e2 } = await supabaseAdmin.from("competitors").upsert(COMPETITORS, { onConflict: "id" });
    results.competitors = e2 ? { ok: false, error: e2.message } : { ok: true, count: COMPETITORS.length };

    // 3. Recommendations (clear + insert)
    await supabaseAdmin.from("recommendations").delete().neq("product_id", "NEVER");
    const { error: e3 } = await supabaseAdmin.from("recommendations").insert(RECOMMENDATIONS);
    results.recommendations = e3 ? { ok: false, error: e3.message } : { ok: true, count: RECOMMENDATIONS.length };

    // 4. Audit log (clear + insert)
    await supabaseAdmin.from("audit_log").delete().not("id", "is", null);
    const { error: e4 } = await supabaseAdmin.from("audit_log").insert(AUDIT_LOG);
    results.audit_log = e4 ? { ok: false, error: e4.message } : { ok: true, count: AUDIT_LOG.length };

    // 5. Model accuracy (clear + insert)
    await supabaseAdmin.from("model_accuracy").delete().not("id", "is", null);
    const { error: e5 } = await supabaseAdmin.from("model_accuracy").insert(MODEL_ACCURACY);
    results.model_accuracy = e5 ? { ok: false, error: e5.message } : { ok: true, count: MODEL_ACCURACY.length };

    // 6. Alert rules (clear + insert)
    await supabaseAdmin.from("alert_rules").delete().neq("id", "NEVER");
    const { error: e6 } = await supabaseAdmin.from("alert_rules").insert(ALERT_RULES);
    results.alert_rules = e6 ? { ok: false, error: e6.message } : { ok: true, count: ALERT_RULES.length };

    // 7. Alert events (clear + insert)
    const alertEvents = buildAlertEvents();
    await supabaseAdmin.from("alert_events").delete().neq("id", "NEVER");
    const { error: e7 } = await supabaseAdmin.from("alert_events").insert(alertEvents);
    results.alert_events = e7 ? { ok: false, error: e7.message } : { ok: true, count: alertEvents.length };

    // 8. Scraped data (clear + insert)
    const scrapedRows = buildScrapedData();
    await supabaseAdmin.from("scraped_data").delete().not("id", "is", null);
    const { error: e8 } = await supabaseAdmin.from("scraped_data").insert(scrapedRows);
    results.scraped_data = e8 ? { ok: false, error: e8.message } : { ok: true, count: scrapedRows.length };

    // 9. Recent events (clear + insert)
    const recentRows = buildRecentEvents();
    await supabaseAdmin.from("recent_events").delete().not("id", "is", null);
    const { error: e9 } = await supabaseAdmin.from("recent_events").insert(recentRows);
    results.recent_events = e9 ? { ok: false, error: e9.message } : { ok: true, count: recentRows.length };

    const allOk = Object.values(results).every((r) => r.ok);
    return NextResponse.json({ success: allOk, results }, { status: allOk ? 200 : 207 });

  } catch (err: any) {
    console.error("[seed] Unexpected error:", err);
    return NextResponse.json({ success: false, error: err.message, results }, { status: 500 });
  }
}

// GET /api/seed — show a simple trigger page
export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>🌱 Database Seed</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 40px; max-width: 560px; width: 100%; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
    p  { font-size: 14px; color: #94a3b8; margin-bottom: 24px; line-height: 1.6; }
    button { background: #6366f1; color: #fff; border: none; border-radius: 10px; padding: 12px 28px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #4f46e5; }
    button:disabled { background: #475569; cursor: not-allowed; }
    pre { background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 16px; font-size: 12px; margin-top: 24px; overflow: auto; max-height: 360px; line-height: 1.6; }
    .ok  { color: #4ade80; }
    .err { color: #f87171; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌱 Database Seed</h1>
    <p>Replaces all tables with the canonical <strong>B2B SaaS product set</strong>:<br/>
    Enterprise CRM License · Cloud Storage Pro · API Gateway Plus · Data Analytics Suite · Security Shield Pro</p>
    <button id="btn" onclick="runSeed()">Run Seed Now</button>
    <pre id="out" style="display:none"></pre>
  </div>
  <script>
    async function runSeed() {
      const btn = document.getElementById('btn');
      const out = document.getElementById('out');
      btn.disabled = true;
      btn.textContent = '⏳ Seeding…';
      out.style.display = 'block';
      out.textContent = 'Connecting to Supabase…';
      try {
        const res = await fetch('/api/seed', { method: 'POST' });
        const json = await res.json();
        let txt = json.success ? '✅ Seed complete!\\n\\n' : '⚠️ Partial seed — check errors\\n\\n';
        for (const [table, result] of Object.entries(json.results || {})) {
          const r = result;
          txt += r.ok
            ? \`✅ \${table.padEnd(20)} \${r.count} rows\\n\`
            : \`❌ \${table.padEnd(20)} \${r.error}\\n\`;
        }
        out.textContent = txt;
        btn.textContent = json.success ? '✅ Done!' : '⚠️ Partial';
      } catch(e) {
        out.textContent = '❌ Network error: ' + e.message;
        btn.textContent = 'Retry';
        btn.disabled = false;
      }
    }
  </script>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
