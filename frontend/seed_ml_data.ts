import { supabaseAdmin } from "./lib/server/supabaseAdmin";

// ─── Real B2B SaaS Products ────────────────────────────────────────────────
const PRODUCTS = [
  { product_id: "P-1001", name: "Enterprise CRM License",  your_price: 2400,  category: "Software",        sku: "CRM-ENT-01" },
  { product_id: "P-1002", name: "Cloud Storage Pro",        your_price: 1068,  category: "Infrastructure",  sku: "CSP-PRO-02" },
  { product_id: "P-1003", name: "API Gateway Plus",         your_price: 3588,  category: "Infrastructure",  sku: "API-GW-03"  },
  { product_id: "P-1004", name: "Data Analytics Suite",     your_price: 5988,  category: "Analytics",       sku: "DAS-PRO-04" },
  { product_id: "P-1005", name: "Security Shield Pro",      your_price: 2388,  category: "Security",        sku: "SEC-SHP-05" },
];

// ─── Real Competitors ──────────────────────────────────────────────────────
const COMPETITORS = [
  { id: "C-01", name: "TechVault"  },
  { id: "C-02", name: "CloudNine"  },
  { id: "C-03", name: "DataPrime"  },
  { id: "C-04", name: "CyberEdge"  },
  { id: "C-05", name: "InnoSoft"   },
];

// ─── ML Recommendations (one per product) ──────────────────────────────────
const RECOMMENDATIONS = [
  {
    product_id:        "P-1001",
    product_name:      "Enterprise CRM License",
    segment:           "Enterprise",
    region:            "North America",
    current_price:     2400,
    recommended_price: 2580,
    floor_price:       2100,
    ceiling_price:     2800,
    confidence:        0.92,
    impact:            7.5,
    rationale:         "TechVault raised Enterprise CRM price by 9%. Demand stable. Margin 4% below target. Recommend 7.5% increase to capture uplift.",
    status:            "pending",
  },
  {
    product_id:        "P-1002",
    product_name:      "Cloud Storage Pro",
    segment:           "SMB",
    region:            "North America",
    current_price:     1068,
    recommended_price: 998,
    floor_price:       920,
    ceiling_price:     1150,
    confidence:        0.78,
    impact:            -6.6,
    rationale:         "3 competitors dropped below ₹1,000. Win rate fell 12% in last 30 days. Lower price to recover SMB deal flow.",
    status:            "pending",
  },
  {
    product_id:        "P-1003",
    product_name:      "API Gateway Plus",
    segment:           "Mid-Market",
    region:            "EMEA",
    current_price:     3588,
    recommended_price: 3588,
    floor_price:       3200,
    ceiling_price:     3900,
    confidence:        0.88,
    impact:            0,
    rationale:         "Market stable. Margin healthy at 22%. No significant competitor movement in last 90 days. Hold current price.",
    status:            "pending",
  },
  {
    product_id:        "P-1004",
    product_name:      "Data Analytics Suite",
    segment:           "Enterprise",
    region:            "North America",
    current_price:     5988,
    recommended_price: 6200,
    floor_price:       5500,
    ceiling_price:     6800,
    confidence:        0.83,
    impact:            3.5,
    rationale:         "Premium segment demand up 18%. Only 1 competitor (DataPrime) in this price bracket. Recommend 3.5% increase.",
    status:            "pending",
  },
  {
    product_id:        "P-1005",
    product_name:      "Security Shield Pro",
    segment:           "SMB",
    region:            "APAC",
    current_price:     2388,
    recommended_price: 2200,
    floor_price:       2100,
    ceiling_price:     2600,
    confidence:        0.71,
    impact:            -7.9,
    rationale:         "InnoSoft undercut by ₹320. Losing SMB deals consistently for 60 days. Lower price to restore win rate.",
    status:            "pending",
  },
];

// ─── Audit Log ─────────────────────────────────────────────────────────────
const AUDIT_LOG = [
  { user_name: "Shantanu D.", product_name: "Enterprise CRM License",  old_price: 2200, new_price: 2400, change_pct:  9.1, outcome: "+1.4% margin",  rationale: "ML recommendation accepted — competitor uplift", timestamp: "2026-04-20T10:00:00Z" },
  { user_name: "Priya M.",    product_name: "Cloud Storage Pro",        old_price: 1068, new_price: 1068, change_pct:  0.0, outcome: "No change",       rationale: "Rejected — awaiting Q2 review",               timestamp: "2026-04-18T14:30:00Z" },
  { user_name: "Shantanu D.", product_name: "API Gateway Plus",         old_price: 3400, new_price: 3588, change_pct:  5.5, outcome: "+0.9% margin",  rationale: "Modified — strategic pricing with new features", timestamp: "2026-04-15T09:00:00Z" },
  { user_name: "Raj P.",      product_name: "Data Analytics Suite",     old_price: 5600, new_price: 5988, change_pct:  6.9, outcome: "+2.1% margin",  rationale: "ML recommendation accepted — demand surge",       timestamp: "2026-04-10T11:15:00Z" },
  { user_name: "Admin Bot",   product_name: "Security Shield Pro",      old_price: 2500, new_price: 2388, change_pct: -4.5, outcome: "Neutral",        rationale: "Auto-match competitor floor price",               timestamp: "2026-04-08T08:00:00Z" },
];

// ─── Model Accuracy History ────────────────────────────────────────────────
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

// ─── Alert Rules ───────────────────────────────────────────────────────────
const ALERT_RULES = [
  { id: "AR-1", name: "Competitor Price Drop",  condition: "Any competitor drops price > 5%",          channel: "in-app", active: true,  created_at: "2025-09-15T10:00:00Z" },
  { id: "AR-2", name: "Margin Below Target",    condition: "Margin dips below 15%",                    channel: "in-app", active: true,  created_at: "2025-09-20T14:00:00Z" },
  { id: "AR-3", name: "ML Confidence Drop",     condition: "Model confidence falls below 70%",         channel: "in-app", active: false, created_at: "2025-10-01T09:00:00Z" },
  { id: "AR-4", name: "Scrape Failure",         condition: "Any source fails to scrape for > 24h",     channel: "in-app", active: true,  created_at: "2025-10-05T11:00:00Z" },
  { id: "AR-5", name: "Win Rate Drop",          condition: "Win rate drops >10% in a 30-day window",   channel: "in-app", active: true,  created_at: "2025-11-01T08:00:00Z" },
];

// ─── Alert Events ──────────────────────────────────────────────────────────
const now = Date.now();
const ALERT_EVENTS = [
  { id: "AE-1", rule_name: "Competitor Price Drop", severity: "high",   message: "TechVault dropped Enterprise CRM price by 12%",               timestamp: new Date(now - 2  * 3600000).toISOString(), read: false },
  { id: "AE-2", rule_name: "Margin Below Target",   severity: "medium", message: "Cloud Storage Pro margin at 13.2% (below 15% target)",         timestamp: new Date(now - 8  * 3600000).toISOString(), read: false },
  { id: "AE-3", rule_name: "Competitor Price Drop", severity: "high",   message: "DataPrime reduced API Gateway pricing by 7.5%",                timestamp: new Date(now - 24 * 3600000).toISOString(), read: true  },
  { id: "AE-4", rule_name: "Scrape Failure",        severity: "low",    message: "CyberEdge scraper returned 403 — retrying",                   timestamp: new Date(now - 36 * 3600000).toISOString(), read: true  },
  { id: "AE-5", rule_name: "ML Confidence Drop",    severity: "medium", message: "Model confidence for Security Shield Pro at 62%",             timestamp: new Date(now - 48 * 3600000).toISOString(), read: true  },
  { id: "AE-6", rule_name: "Win Rate Drop",         severity: "high",   message: "Security Shield Pro SMB win rate dropped from 71% to 48%",    timestamp: new Date(now - 72 * 3600000).toISOString(), read: true  },
];

// ─── Scraped Competitor Pricing (scraped_data table) ──────────────────────
function buildScrapedData() {
  const rows: any[] = [];
  const competitorMultipliers: Record<string, number> = {
    "C-01": 1.07,   // TechVault — premium
    "C-02": 1.02,   // CloudNine — slight premium
    "C-03": 0.97,   // DataPrime — slight discount
    "C-04": 0.93,   // CyberEdge — value
    "C-05": 0.90,   // InnoSoft — aggressive
  };

  for (const prod of PRODUCTS) {
    for (const comp of COMPETITORS) {
      const mult = competitorMultipliers[comp.id] ?? 1.0;
      // 3 snapshots over time
      for (let i = 0; i < 3; i++) {
        const jitter = 0.98 + Math.random() * 0.04;
        rows.push({
          product_id:    prod.product_id,
          competitor_id: comp.id,
          price:         Math.round(prod.your_price * mult * jitter),
          created_at:    new Date(now - i * 7 * 86400000).toISOString(),
        });
      }
    }
  }
  return rows;
}

// ─── Recent Events (price change feed) ────────────────────────────────────
const RECENT_EVENTS = [
  { product_id: "P-1001", product_name: "Enterprise CRM License",  competitor: "TechVault",  old_price: 2160, new_price: 2400, change_pct:  11.1, timestamp: new Date(now -  2 * 3600000).toISOString() },
  { product_id: "P-1002", product_name: "Cloud Storage Pro",        competitor: "CloudNine",  old_price: 1100, new_price: 1020, change_pct:  -7.3, timestamp: new Date(now -  6 * 3600000).toISOString() },
  { product_id: "P-1003", product_name: "API Gateway Plus",         competitor: "DataPrime",  old_price: 3800, new_price: 3520, change_pct:  -7.4, timestamp: new Date(now - 14 * 3600000).toISOString() },
  { product_id: "P-1004", product_name: "Data Analytics Suite",     competitor: "CyberEdge", old_price: 5600, new_price: 5900, change_pct:   5.4, timestamp: new Date(now - 22 * 3600000).toISOString() },
  { product_id: "P-1005", product_name: "Security Shield Pro",      competitor: "InnoSoft",   old_price: 2600, new_price: 2100, change_pct: -19.2, timestamp: new Date(now - 30 * 3600000).toISOString() },
  { product_id: "P-1001", product_name: "Enterprise CRM License",  competitor: "InnoSoft",   old_price: 2300, new_price: 2450, change_pct:   6.5, timestamp: new Date(now - 48 * 3600000).toISOString() },
  { product_id: "P-1002", product_name: "Cloud Storage Pro",        competitor: "CyberEdge", old_price:  980, new_price:  940, change_pct:  -4.1, timestamp: new Date(now - 54 * 3600000).toISOString() },
];

// ─── Main Seed Function ────────────────────────────────────────────────────
async function seed() {
  console.log("\n🌱 Starting full database seed...\n");

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
  await supabaseAdmin.from("recommendations").delete().neq("product_id", "NEVER_EXISTS");
  const { error: recErr } = await supabaseAdmin.from("recommendations").insert(RECOMMENDATIONS);
  if (recErr) console.error("  ❌ Recommendations:", recErr.message);
  else console.log(`  ✅ ${RECOMMENDATIONS.length} recommendations inserted`);

  // 4. Audit Log
  console.log("📋 Seeding audit log...");
  await supabaseAdmin.from("audit_log").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: auditErr } = await supabaseAdmin.from("audit_log").insert(AUDIT_LOG);
  if (auditErr) console.error("  ❌ Audit log:", auditErr.message);
  else console.log(`  ✅ ${AUDIT_LOG.length} audit entries inserted`);

  // 5. Model Accuracy
  console.log("📊 Seeding model accuracy...");
  await supabaseAdmin.from("model_accuracy").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: accErr } = await supabaseAdmin.from("model_accuracy").insert(MODEL_ACCURACY);
  if (accErr) console.error("  ❌ Model accuracy:", accErr.message);
  else console.log(`  ✅ ${MODEL_ACCURACY.length} months inserted`);

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
  await supabaseAdmin.from("scraped_data").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const scrapedRows = buildScrapedData();
  const { error: scrapedErr } = await supabaseAdmin.from("scraped_data").insert(scrapedRows);
  if (scrapedErr) console.error("  ❌ Scraped data:", scrapedErr.message);
  else console.log(`  ✅ ${scrapedRows.length} scraped price rows inserted`);

  // 9. Recent Events
  console.log("📡 Seeding recent price change events...");
  await supabaseAdmin.from("recent_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: recentErr } = await supabaseAdmin.from("recent_events").insert(RECENT_EVENTS);
  if (recentErr) console.error("  ❌ Recent events:", recentErr.message);
  else console.log(`  ✅ ${RECENT_EVENTS.length} recent events inserted`);

  console.log("\n✅ Full seed complete!\n");
}

seed().catch(console.error);
