import { supabaseAdmin } from "./lib/server/supabaseAdmin";

// ─── Real B2B SaaS Products from seed_data.sql ──────────────────────────────
const PRODUCTS = [
  { product_id: "P-1001", name: "Wireless Headphones X1",      sku: "SKU-WH-X1",   category: "Audio",       your_price: 96.50 },
  { product_id: "P-1042", name: "Smart Speaker Plus",           sku: "SKU-SS-PL",   category: "Smart Home",  your_price: 149.00 },
  { product_id: "P-2011", name: "USB-C Hub Pro 7-in-1",         sku: "SKU-UC-H7",   category: "Accessories", your_price: 54.00 },
  { product_id: "P-1089", name: "Noise Cancel Pro Earbuds",     sku: "SKU-NC-PRO",  category: "Audio",       your_price: 210.00 },
  { product_id: "P-3301", name: "BT Mechanical Keyboard Elite", sku: "SKU-BT-MKE",  category: "Peripherals", your_price: 78.00 },
];

// ─── Real Competitors ──────────────────────────────────────────────────────
const COMPETITORS = [
  { id: "C-001", name: "BrandZ" },
  { id: "C-002", name: "AlphaCo" },
  { id: "C-003", name: "NovaTech" },
  { id: "C-004", name: "PrimeSys" },
  { id: "C-005", name: "CoreEdge" },
  { id: "C-006", name: "StellarGear" },
  { id: "C-007", name: "ApexSound" },
];

// ─── ML Recommendations ────────────────────────────────────────────────────
const RECOMMENDATIONS = [
  { id: "R-001", product_id: "P-1001", current_price: 96.50, recommended_price: 99.00, floor_price: 94.00, ceiling_price: 104.00, confidence: 92, impact: 1.2, status: "pending", segment: "Enterprise", region: "North India", rationale: "BrandZ raised price by 8% to $98.70 this week — highest in 90 days. Market avg moved to $92.30. Your margin is 3.8% below the 18% target. Demand index stable at 0.94. Recommend raising to $99 to capture margin without losing competitive position." },
  { id: "R-002", product_id: "P-1042", current_price: 149.00, recommended_price: 142.00, floor_price: 138.00, ceiling_price: 152.00, confidence: 78, impact: 0.8, status: "pending", segment: "SMB", region: "West India", rationale: "3 competitors dropped below $145 in the last 7 days. Win rate for Smart Speaker Plus fell from 66% to 54% this month. Deal velocity down 18%. Recommend lowering to $142 to recover SMB win rate without breaching floor margin." },
  { id: "R-003", product_id: "P-2011", current_price: 54.00, recommended_price: 54.00, floor_price: 50.00, ceiling_price: 58.00, confidence: 88, impact: 0.0, status: "pending", segment: "Mid-Market", region: "South India", rationale: "Market pricing stable. Competitor avg $54.30. Your margin at 22% — above target. No significant price movement in 14 days. Seasonality index neutral. Recommend holding current price." },
  { id: "R-004", product_id: "P-1089", current_price: 210.00, recommended_price: 219.00, floor_price: 205.00, ceiling_price: 225.00, confidence: 83, impact: 2.1, status: "pending", segment: "Enterprise", region: "Pan India", rationale: "Premium segment demand index rose 14% QoQ. Only 1 direct competitor (ApexSound) within $10 range. BrandZ is at $224. Enterprise deals closing faster — avg 12 days vs 18 days last quarter. Recommend raising to $219 to narrow gap with BrandZ while staying below ApexSound." },
  { id: "R-005", product_id: "P-3301", current_price: 78.00, recommended_price: 74.00, floor_price: 70.00, ceiling_price: 82.00, confidence: 71, impact: 0.4, status: "pending", segment: "SMB", region: "East India", rationale: "AlphaCo dropped keyboard price from $76 to $69 last week — 9.2% cut. You lost 4 SMB deals in the last 10 days where price was cited as the reason. Recommend lowering to $74 to stay competitive while preserving a $5 margin buffer above AlphaCo." },
];

// ─── Audit Log ─────────────────────────────────────────────────────────────
const AUDIT_LOG = [
  { user_name: "Shantanu D.", product_name: "Wireless Headphones X1", old_price: 93.00, new_price: 96.50, change_pct: 3.8, outcome: "+1.4% margin", rationale: "Accepted ML recommendation. BrandZ raised first — safe window to follow.", timestamp: "2026-04-04T10:00:00Z" },
  { user_name: "Priya M.",    product_name: "Smart Speaker Plus",       old_price: 149.00, new_price: 149.00, change_pct: 0.0, outcome: "No change",     rationale: "Rejected — Q4 campaign in progress. Did not want to raise price during promotional period.", timestamp: "2026-04-06T14:30:00Z" },
  { user_name: "Shantanu D.", product_name: "USB-C Hub Pro 7-in-1",     old_price: 52.00, new_price: 54.00, change_pct: 3.8, outcome: "+0.9% margin", rationale: "Modified recommendation. Raised to $54 instead of suggested $55 — conservative approach.", timestamp: "2026-04-09T09:00:00Z" },
  { user_name: "Rahul V.",    product_name: "Noise Cancel Pro Earbuds", old_price: 205.00, new_price: 210.00, change_pct: 2.4, outcome: "+1.1% margin", rationale: "Accepted. Premium segment showed strong demand signal — comfortable raising.", timestamp: "2026-03-20T11:15:00Z" },
  { user_name: "Priya M.",    product_name: "BT Mechanical Keyboard Elite", old_price: 82.00, new_price: 78.00, change_pct: -4.9, outcome: "+6% win rate recovery", rationale: "Accepted — multiple lost deals cited price as blocker. Needed to move fast.", timestamp: "2026-03-10T08:00:00Z" },
];

// ─── Model Accuracy ────────────────────────────────────────────────────────
const MODEL_ACCURACY = [
  { month: "Nov 2025", mape: 5.8, hit_rate: 71, predictions_count: 14 },
  { month: "Dec 2025", mape: 5.1, hit_rate: 74, predictions_count: 18 },
  { month: "Jan 2026", mape: 4.9, hit_rate: 76, predictions_count: 21 },
  { month: "Feb 2026", mape: 4.6, hit_rate: 78, predictions_count: 19 },
  { month: "Mar 2026", mape: 4.4, hit_rate: 80, predictions_count: 23 },
  { month: "Apr 2026", mape: 4.2, hit_rate: 79, predictions_count: 11 },
];

// ─── Alert Rules ───────────────────────────────────────────────────────────
const ALERT_RULES = [
  { id: "AR-001", name: "Competitor price drop > 5%", condition: "scraped_price_change_pct < -5", channel: "in-app", active: true,  created_at: "2026-01-24T10:00:00Z" },
  { id: "AR-002", name: "Your margin below 18%",   condition: "product_margin_pct < 18",       channel: "in-app", active: true,  created_at: "2026-01-24T14:00:00Z" },
  { id: "AR-003", name: "Win rate drops below 50%",condition: "win_rate_30d < 50",             channel: "email",  active: true,  created_at: "2026-02-24T09:00:00Z" },
  { id: "AR-004", name: "Recommendation confidence below 70%", condition: "recommendation_confidence < 70", channel: "in-app", active: true,  created_at: "2026-03-10T11:00:00Z" },
  { id: "AR-005", name: "Data stale — no scrape in 24h", condition: "last_scrape_age_hours > 24", channel: "in-app", active: true,  created_at: "2026-03-25T08:00:00Z" },
];

// ─── Alert Events ──────────────────────────────────────────────────────────
const ALERT_EVENTS = [
  { id: "AE-001", rule_name: "Competitor price drop > 5%", severity: "high",   message: "AlphaCo dropped BT Mechanical Keyboard Elite from $76.00 to $69.00 — a 9.2% cut. 4 SMB deals lost this week.", timestamp: "2026-04-20T10:00:00Z", read: false },
  { id: "AE-002", rule_name: "Your margin below 18%",   severity: "high",   message: "Wireless Headphones X1 margin fell to 14.2% — 3.8% below the 18% target. Recommend reviewing pricing.", timestamp: "2026-04-22T08:00:00Z", read: false },
  { id: "AE-003", rule_name: "Win rate drops below 50%", severity: "medium", message: "Smart Speaker Plus win rate in SMB segment is now 48% — below 50% threshold for the first time this quarter.", timestamp: "2026-04-21T14:00:00Z", read: false },
];

// ─── Scraped Data ──────────────────────────────────────────────────────────
function buildScrapedData() {
  return [
    { competitor_id: "C-001", product_id: "P-1001", price: 98.70, created_at: new Date().toISOString() },
    { competitor_id: "C-002", product_id: "P-1001", price: 95.10, created_at: new Date().toISOString() },
    { competitor_id: "C-003", product_id: "P-1001", price: 92.00, created_at: new Date().toISOString() },
    { competitor_id: "C-004", product_id: "P-1001", price: 89.50, created_at: new Date().toISOString() },
    { competitor_id: "C-005", product_id: "P-1001", price: 86.20, created_at: new Date().toISOString() },
    { competitor_id: "C-001", product_id: "P-1042", price: 144.99, created_at: new Date().toISOString() },
    { competitor_id: "C-002", product_id: "P-1042", price: 141.00, created_at: new Date().toISOString() },
    { competitor_id: "C-002", product_id: "P-2011", price: 56.00, created_at: new Date().toISOString() },
    { competitor_id: "C-003", product_id: "P-2011", price: 52.50, created_at: new Date().toISOString() },
    { competitor_id: "C-001", product_id: "P-1089", price: 224.00, created_at: new Date().toISOString() },
    { competitor_id: "C-007", product_id: "P-1089", price: 218.00, created_at: new Date().toISOString() },
    { competitor_id: "C-002", product_id: "P-3301", price: 69.00, created_at: new Date().toISOString() },
    { competitor_id: "C-003", product_id: "P-3301", price: 74.00, created_at: new Date().toISOString() },
  ];
}

// ─── Recent Events ──────────────────────────────────────────────────────────
const RECENT_EVENTS = [
  { product_id: "P-3301", product_name: "BT Mechanical Keyboard Elite", competitor: "AlphaCo", old_price: 76.00, new_price: 69.00, change_pct: -9.2, timestamp: "2026-04-20T10:00:00Z" },
  { product_id: "P-1001", product_name: "Wireless Headphones X1",      competitor: "BrandZ",  old_price: 91.00, new_price: 98.70, change_pct: 8.5, timestamp: "2026-04-18T10:00:00Z" },
  { product_id: "P-1042", product_name: "Smart Speaker Plus",           competitor: "NovaTech", old_price: 145.00, new_price: 138.50, change_pct: -4.5, timestamp: "2026-04-17T10:00:00Z" },
];

// ─── Main Seed Function ────────────────────────────────────────────────────
async function seed() {
  console.log("\n🌱 Starting full database seed with canonical data...\n");

  // 1. Products
  console.log("📦 Seeding products...");
  await supabaseAdmin.from("products").delete().neq("product_id", "NEVER_EXISTS");
  const { error: prodErr } = await supabaseAdmin.from("products").upsert(PRODUCTS, { onConflict: "product_id" });
  if (prodErr) console.error("  ❌ Products:", prodErr.message);
  else console.log(`  ✅ ${PRODUCTS.length} products inserted`);

  // 2. Competitors
  console.log("🏢 Seeding competitors...");
  const { error: compErr } = await supabaseAdmin.from("competitors").upsert(COMPETITORS, { onConflict: "id" });
  if (compErr) console.error("  ❌ Competitors:", compErr.message);
  else console.log(`  ✅ ${COMPETITORS.length} competitors inserted`);

  // 3. Recommendations
  console.log("🤖 Seeding recommendations...");
  await supabaseAdmin.from("recommendations").delete().neq("id", "NEVER_EXISTS");
  const { error: recErr } = await supabaseAdmin.from("recommendations").insert(RECOMMENDATIONS);
  if (recErr) console.error("  ❌ Recommendations:", recErr.message);
  else console.log(`  ✅ ${RECOMMENDATIONS.length} recommendations inserted`);

  // 4. Audit Log
  console.log("📋 Seeding audit log...");
  await supabaseAdmin.from("audit_log").delete().not("id", "is", null);
  const { error: auditErr } = await supabaseAdmin.from("audit_log").insert(AUDIT_LOG);
  if (auditErr) console.error("  ❌ Audit log:", auditErr.message);
  else console.log(`  ✅ ${AUDIT_LOG.length} audit entries inserted`);

  // 5. Model Accuracy
  console.log("📊 Seeding model accuracy...");
  await supabaseAdmin.from("model_accuracy").delete().not("id", "is", null);
  const { error: accErr } = await supabaseAdmin.from("model_accuracy").insert(MODEL_ACCURACY);
  if (accErr) console.error("  ❌ Model accuracy:", accErr.message);
  else console.log(`  ✅ ${MODEL_ACCURACY.length} entries inserted`);

  // 6. Alert Rules
  console.log("🔔 Seeding alert rules...");
  await supabaseAdmin.from("alert_rules").delete().neq("id", "NEVER_EXISTS");
  const { error: ruleErr } = await supabaseAdmin.from("alert_rules").insert(ALERT_RULES);
  if (ruleErr) console.error("  ❌ Alert rules:", ruleErr.message);
  else console.log(`  ✅ ${ALERT_RULES.length} alert rules inserted`);

  // 7. Alert Events
  console.log("⚠️  Seeding alert events...");
  await supabaseAdmin.from("alert_events").delete().neq("id", "NEVER_EXISTS");
  const { error: evErr } = await supabaseAdmin.from("alert_events").insert(ALERT_EVENTS);
  if (evErr) console.error("  ❌ Alert events:", evErr.message);
  else console.log(`  ✅ ${ALERT_EVENTS.length} alert events inserted`);

  // 8. Scraped Data
  console.log("🕷️  Seeding scraped competitor prices...");
  await supabaseAdmin.from("scraped_data").delete().not("product_id", "is", null);
  const scrapedRows = buildScrapedData();
  const { error: scrapedErr } = await supabaseAdmin.from("scraped_data").insert(scrapedRows);
  if (scrapedErr) console.error("  ❌ Scraped data:", scrapedErr.message);
  else console.log(`  ✅ ${scrapedRows.length} scraped price rows inserted`);

  // 9. Recent Events
  console.log("📡 Seeding recent price change events...");
  await supabaseAdmin.from("recent_events").delete().not("id", "is", null);
  const { error: recentErr } = await supabaseAdmin.from("recent_events").insert(RECENT_EVENTS);
  if (recentErr) console.error("  ❌ Recent events:", recentErr.message);
  else console.log(`  ✅ ${RECENT_EVENTS.length} recent events inserted`);

  console.log("\n✅ Full seed complete!\n");
}

seed().catch(console.error);
