// app/api/seed/route.ts
// Browser-callable seed endpoint — POST /api/seed
// Only available in development. In production, protect with a secret token.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

// ─── Canonical product & competitor data ─────────────────────────────────────
// ─── Canonical product & competitor data ─────────────────────────────────────
const PRODUCTS = [
  { product_id: "P-1001", name: "Wireless Headphones X1",      sku: "SKU-WH-X1",   category: "Audio",       your_price: 96.50 },
  { product_id: "P-1042", name: "Smart Speaker Plus",           sku: "SKU-SS-PL",   category: "Smart Home",  your_price: 149.00 },
  { product_id: "P-2011", name: "USB-C Hub Pro 7-in-1",         sku: "SKU-UC-H7",   category: "Accessories", your_price: 54.00 },
  { product_id: "P-1089", name: "Noise Cancel Pro Earbuds",     sku: "SKU-NC-PRO",  category: "Audio",       your_price: 210.00 },
  { product_id: "P-3301", name: "BT Mechanical Keyboard Elite", sku: "SKU-BT-MKE",  category: "Peripherals", your_price: 78.00 },
];

const COMPETITORS = [
  { id: "C-001", name: "BrandZ" },
  { id: "C-002", name: "AlphaCo" },
  { id: "C-003", name: "NovaTech" },
  { id: "C-004", name: "PrimeSys" },
  { id: "C-005", name: "CoreEdge" },
  { id: "C-006", name: "StellarGear" },
  { id: "C-007", name: "ApexSound" },
];

const RECOMMENDATIONS = [
  { id: "R-001", product_id: "P-1001", current_price: 96.50, recommended_price: 99.00, floor_price: 94.00, ceiling_price: 104.00, confidence: 92, impact: 1.2, status: "pending", segment: "Enterprise", region: "North India", rationale: "BrandZ raised price by 8% to $98.70 this week — highest in 90 days. Market avg moved to $92.30. Your margin is 3.8% below the 18% target. Demand index stable at 0.94. Recommend raising to $99 to capture margin without losing competitive position." },
  { id: "R-002", product_id: "P-1042", current_price: 149.00, recommended_price: 142.00, floor_price: 138.00, ceiling_price: 152.00, confidence: 78, impact: 0.8, status: "pending", segment: "SMB", region: "West India", rationale: "3 competitors dropped below $145 in the last 7 days. Win rate for Smart Speaker Plus fell from 66% to 54% this month. Deal velocity down 18%. Recommend lowering to $142 to recover SMB win rate without breaching floor margin." },
  { id: "R-003", product_id: "P-2011", current_price: 54.00, recommended_price: 54.00, floor_price: 50.00, ceiling_price: 58.00, confidence: 88, impact: 0.0, status: "pending", segment: "Mid-Market", region: "South India", rationale: "Market pricing stable. Competitor avg $54.30. Your margin at 22% — above target. No significant price movement in 14 days. Seasonality index neutral. Recommend holding current price." },
  { id: "R-004", product_id: "P-1089", current_price: 210.00, recommended_price: 219.00, floor_price: 205.00, ceiling_price: 225.00, confidence: 83, impact: 2.1, status: "pending", segment: "Enterprise", region: "Pan India", rationale: "Premium segment demand index rose 14% QoQ. Only 1 direct competitor (ApexSound) within $10 range. BrandZ is at $224. Enterprise deals closing faster — avg 12 days vs 18 days last quarter. Recommend raising to $219 to narrow gap with BrandZ while staying below ApexSound." },
  { id: "R-005", product_id: "P-3301", current_price: 78.00, recommended_price: 74.00, floor_price: 70.00, ceiling_price: 82.00, confidence: 71, impact: 0.4, status: "pending", segment: "SMB", region: "East India", rationale: "AlphaCo dropped keyboard price from $76 to $69 last week — 9.2% cut. You lost 4 SMB deals in the last 10 days where price was cited as the reason. Recommend lowering to $74 to stay competitive while preserving a $5 margin buffer above AlphaCo." },
];

const AUDIT_LOG = [
  { user_name: "Shantanu D.", product_name: "Wireless Headphones X1", old_price: 93.00, new_price: 96.50, change_pct: 3.8, outcome: "+1.4% margin", rationale: "Accepted ML recommendation. BrandZ raised first — safe window to follow.", timestamp: "2026-04-04T10:00:00Z" },
  { user_name: "Priya M.",    product_name: "Smart Speaker Plus",       old_price: 149.00, new_price: 149.00, change_pct: 0.0, outcome: "No change",     rationale: "Rejected — Q4 campaign in progress. Did not want to raise price during promotional period.", timestamp: "2026-04-06T14:30:00Z" },
  { user_name: "Shantanu D.", product_name: "USB-C Hub Pro 7-in-1",     old_price: 52.00, new_price: 54.00, change_pct: 3.8, outcome: "+0.9% margin", rationale: "Modified recommendation. Raised to $54 instead of suggested $55 — conservative approach.", timestamp: "2026-04-09T09:00:00Z" },
  { user_name: "Rahul V.",    product_name: "Noise Cancel Pro Earbuds", old_price: 205.00, new_price: 210.00, change_pct: 2.4, outcome: "+1.1% margin", rationale: "Accepted. Premium segment showed strong demand signal — comfortable raising.", timestamp: "2026-03-20T11:15:00Z" },
  { user_name: "Priya M.",    product_name: "BT Mechanical Keyboard Elite", old_price: 82.00, new_price: 78.00, change_pct: -4.9, outcome: "+6% win rate recovery", rationale: "Accepted — multiple lost deals cited price as blocker. Needed to move fast.", timestamp: "2026-03-10T08:00:00Z" },
];

const MODEL_ACCURACY = [
  { month: "Nov 2025", mape: 5.8, hit_rate: 71, predictions_count: 14 },
  { month: "Dec 2025", mape: 5.1, hit_rate: 74, predictions_count: 18 },
  { month: "Jan 2026", mape: 4.9, hit_rate: 76, predictions_count: 21 },
  { month: "Feb 2026", mape: 4.6, hit_rate: 78, predictions_count: 19 },
  { month: "Mar 2026", mape: 4.4, hit_rate: 80, predictions_count: 23 },
  { month: "Apr 2026", mape: 4.2, hit_rate: 79, predictions_count: 11 },
];

const ALERT_RULES = [
  { id: "AR-001", name: "Competitor price drop > 5%", condition: "scraped_price_change_pct < -5", channel: "in-app", active: true,  created_at: "2026-01-24T10:00:00Z" },
  { id: "AR-002", name: "Your margin below 18%",   condition: "product_margin_pct < 18",       channel: "in-app", active: true,  created_at: "2026-01-24T14:00:00Z" },
  { id: "AR-003", name: "Win rate drops below 50%",condition: "win_rate_30d < 50",             channel: "email",  active: true,  created_at: "2026-02-24T09:00:00Z" },
  { id: "AR-004", name: "Recommendation confidence below 70%", condition: "recommendation_confidence < 70", channel: "in-app", active: true,  created_at: "2026-03-10T11:00:00Z" },
  { id: "AR-005", name: "Data stale — no scrape in 24h", condition: "last_scrape_age_hours > 24", channel: "in-app", active: true,  created_at: "2026-03-25T08:00:00Z" },
];

function buildAlertEvents(): any[] {
  return [
    { id: "AE-001", rule_name: "Competitor price drop > 5%", severity: "high",   message: "AlphaCo dropped BT Mechanical Keyboard Elite from $76.00 to $69.00 — a 9.2% cut. 4 SMB deals lost this week.", timestamp: "2026-04-20T10:00:00Z", read: false },
    { id: "AE-002", rule_name: "Your margin below 18%",   severity: "high",   message: "Wireless Headphones X1 margin fell to 14.2% — 3.8% below the 18% target. Recommend reviewing pricing.", timestamp: "2026-04-22T08:00:00Z", read: false },
    { id: "AE-003", rule_name: "Win rate drops below 50%", severity: "medium", message: "Smart Speaker Plus win rate in SMB segment is now 48% — below 50% threshold for the first time this quarter.", timestamp: "2026-04-21T14:00:00Z", read: false },
  ];
}

function buildScrapedData(): any[] {
  return [
    { competitor_id: "C-001", product_id: "P-1001", price: 98.70, scraped_at: new Date().toISOString() },
    { competitor_id: "C-002", product_id: "P-1001", price: 95.10, scraped_at: new Date().toISOString() },
    { competitor_id: "C-003", product_id: "P-1001", price: 92.00, scraped_at: new Date().toISOString() },
    { competitor_id: "C-004", product_id: "P-1001", price: 89.50, scraped_at: new Date().toISOString() },
    { competitor_id: "C-005", product_id: "P-1001", price: 86.20, scraped_at: new Date().toISOString() },
    { competitor_id: "C-001", product_id: "P-1042", price: 144.99, scraped_at: new Date().toISOString() },
    { competitor_id: "C-002", product_id: "P-1042", price: 141.00, scraped_at: new Date().toISOString() },
    { competitor_id: "C-002", product_id: "P-2011", price: 56.00, scraped_at: new Date().toISOString() },
    { competitor_id: "C-003", product_id: "P-2011", price: 52.50, scraped_at: new Date().toISOString() },
    { competitor_id: "C-001", product_id: "P-1089", price: 224.00, scraped_at: new Date().toISOString() },
    { competitor_id: "C-007", product_id: "P-1089", price: 218.00, scraped_at: new Date().toISOString() },
    { competitor_id: "C-002", product_id: "P-3301", price: 69.00, scraped_at: new Date().toISOString() },
    { competitor_id: "C-003", product_id: "P-3301", price: 74.00, scraped_at: new Date().toISOString() },
  ];
}

function buildRecentEvents(): any[] {
  return [
    { product_id: "P-3301", product_name: "BT Mechanical Keyboard Elite", competitor: "AlphaCo", old_price: 76.00, new_price: 69.00, change_pct: -9.2, timestamp: "2026-04-20T10:00:00Z" },
    { product_id: "P-1001", product_name: "Wireless Headphones X1",      competitor: "BrandZ",  old_price: 91.00, new_price: 98.70, change_pct: 8.5, timestamp: "2026-04-18T10:00:00Z" },
    { product_id: "P-1042", product_name: "Smart Speaker Plus",           competitor: "NovaTech", old_price: 145.00, new_price: 138.50, change_pct: -4.5, timestamp: "2026-04-17T10:00:00Z" },
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
    await supabaseAdmin.from("recommendations").delete().neq("id", "NEVER");
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
    await supabaseAdmin.from("scraped_data").delete().not("product_id", "is", null);
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
