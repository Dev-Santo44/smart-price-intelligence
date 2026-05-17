// lib/server/db/analytics.ts
import { supabaseAdmin } from "../supabaseAdmin";

// ─── Demo/Seed Data (used as fallback when DB tables are empty) ────────────────

const DEMO_PRODUCTS = [
  { id: "P-1001", product_id: "P-1001", name: "Enterprise CRM License", your_price: 2400, category: "Software", sku: "CRM-ENT-01" },
  { id: "P-1002", product_id: "P-1002", name: "Cloud Storage Pro", your_price: 1068, category: "Infrastructure", sku: "CSP-PRO-02" },
  { id: "P-1003", product_id: "P-1003", name: "API Gateway Plus", your_price: 3588, category: "Infrastructure", sku: "API-GW-03" },
  { id: "P-1004", product_id: "P-1004", name: "Data Analytics Suite", your_price: 5988, category: "Analytics", sku: "DAS-PRO-04" },
  { id: "P-1005", product_id: "P-1005", name: "Security Shield Pro", your_price: 2388, category: "Security", sku: "SEC-SHP-05" },
];

const DEMO_COMPETITORS = [
  { id: "C-01", name: "TechVault" },
  { id: "C-02", name: "CloudNine" },
  { id: "C-03", name: "DataPrime" },
  { id: "C-04", name: "CyberEdge" },
  { id: "C-05", name: "InnoSoft" },
];

// ─── Demo Generators ──────────────────────────────────────────────────────────

function generateDemoHeatmap(products = DEMO_PRODUCTS, competitors = DEMO_COMPETITORS) {
  const rows: any[] = [];
  for (const comp of competitors) {
    const row: any = { competitor: comp.name, competitor_id: comp.id };
    for (const prod of products) {
      const variation = 0.85 + Math.random() * 0.3;
      row[prod.product_id] = {
        price: Math.round(prod.your_price * variation),
        your_price: prod.your_price,
        delta_pct: Math.round((variation - 1) * 100 * 10) / 10,
        product_name: prod.name,
      };
    }
    rows.push(row);
  }
  return rows;
}

function generateDemoDistribution(productId: string, products = DEMO_PRODUCTS) {
  const product = products.find((p) => p.product_id === productId) || products[0];
  const base = product.your_price;
  const buckets: any[] = [];
  const offsets = [-20, -15, -10, -5, 0, 5, 10, 15, 20];
  for (const offset of offsets) {
    const price = Math.round(base * (1 + offset / 100));
    buckets.push({
      price_range: `₹${price - 50}–₹${price + 50}`,
      mid_price: price,
      count: Math.floor(Math.random() * 8) + 1,
      is_your_price: offset === 0,
    });
  }
  return {
    buckets,
    your_price: base,
    your_percentile: Math.round(40 + Math.random() * 30),
    market_median: Math.round(base * (0.97 + Math.random() * 0.06)),
  };
}

function generateDemoPriceChanges(products = DEMO_PRODUCTS, competitors = DEMO_COMPETITORS) {
  const changes: any[] = [];
  const now = Date.now();
  for (let i = 0; i < 15; i++) {
    const comp = competitors[Math.floor(Math.random() * competitors.length)];
    const prod = products[Math.floor(Math.random() * products.length)];
    const oldPrice = prod.your_price * (0.9 + Math.random() * 0.2);
    const changePct = -8 + Math.random() * 16;
    const newPrice = oldPrice * (1 + changePct / 100);
    changes.push({
      id: `CHG-${i}`,
      competitor: comp.name,
      product_name: prod.name,
      product_id: prod.product_id,
      old_price: Math.round(oldPrice),
      new_price: Math.round(newPrice),
      change_pct: Math.round(changePct * 10) / 10,
      timestamp: new Date(now - i * 3600 * 1000 * (6 + Math.random() * 18)).toISOString(),
    });
  }
  return changes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateDemoFeatureMatrix(products = DEMO_PRODUCTS, competitors = DEMO_COMPETITORS) {
  const features = ["SSO / SAML", "API Access", "Custom Reports", "24/7 Support", "SLA 99.9%", "Multi-Region", "Audit Logs", "Data Export"];
  const tiers = ["Basic", "Pro", "Enterprise"];
  const matrix: any[] = [];
  for (const comp of [...competitors, { id: "YOU", name: "Your Product" }]) {
    const row: any = { competitor: comp.name, tiers: {} };
    for (const tier of tiers) {
      row.tiers[tier] = {
        price: Math.round(800 + Math.random() * 5000),
        features: features.map((f) => ({
          name: f,
          included: comp.name === "Your Product" ? Math.random() > 0.15 : Math.random() > 0.35,
        })),
      };
    }
    matrix.push(row);
  }
  return { features, tiers, matrix };
}

function generateDemoPriceTrend(days = 90, products = DEMO_PRODUCTS, competitors = DEMO_COMPETITORS) {
  const series: any[] = [];
  const now = Date.now();
  const base = products[0]?.your_price ?? 2400;
  for (let d = days; d >= 0; d--) {
    const date = new Date(now - d * 86400000).toISOString().slice(0, 10);
    const point: any = { date, your_price: base + Math.sin(d / 15) * 100 + (Math.random() - 0.5) * 50 };
    for (const comp of competitors.slice(0, 3)) {
      point[comp.name] = point.your_price * (0.9 + Math.random() * 0.2);
    }
    series.push(point);
  }
  return series;
}

function generateDemoElasticity() {
  const points: any[] = [];
  for (let i = 0; i < 30; i++) {
    const priceChange = -15 + Math.random() * 30;
    const volumeChange = -priceChange * (0.8 + Math.random() * 0.8) + (Math.random() - 0.5) * 10;
    points.push({
      price_change_pct: Math.round(priceChange * 10) / 10,
      volume_change_pct: Math.round(volumeChange * 10) / 10,
      period: `Q${Math.ceil(((i % 12) + 1) / 3)} ${2024 + Math.floor(i / 12)}`,
    });
  }
  return { points, elasticity_coefficient: -1.35, r_squared: 0.72 };
}

function generateDemoWinLoss() {
  const bands = ["< ₹1,500", "₹1,500–₹2,000", "₹2,000–₹2,500", "₹2,500–₹3,000", "₹3,000–₹3,500", "> ₹3,500"];
  return bands.map((band) => ({
    band,
    wins: Math.floor(15 + Math.random() * 40),
    losses: Math.floor(5 + Math.random() * 25),
    win_rate: Math.round((55 + Math.random() * 30) * 10) / 10,
  }));
}

function generateDemoSeasonality() {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months.map((month, i) => ({
    month,
    avg_price: Math.round(2200 + Math.sin(i / 2) * 300 + Math.random() * 100),
    demand_index: Math.round((80 + Math.sin((i + 3) / 2) * 30 + Math.random() * 10) * 10) / 10,
  }));
}

function generateDemoAuditLog(products = DEMO_PRODUCTS) {
  const users = ["Shantanu M.", "Priya K.", "Raj P.", "Admin Bot"];
  const rationales = [
    "Competitor undercut by 8%, matching market",
    "Quarterly review — margin optimization",
    "Customer feedback: too expensive for SMBs",
    "ML model recommendation applied",
    "Seasonal adjustment for Q4 demand surge",
    "New feature launch premium",
  ];
  const outcomes = ["Positive", "Neutral", "Negative", "Pending"];
  const logs: any[] = [];
  const now = Date.now();
  for (let i = 0; i < 12; i++) {
    const old_price = 2000 + Math.random() * 2000;
    const new_price = old_price * (0.92 + Math.random() * 0.16);
    logs.push({
      id: `AUD-${i}`,
      timestamp: new Date(now - i * 86400000 * (2 + Math.random() * 5)).toISOString(),
      user: users[Math.floor(Math.random() * users.length)],
      product: products[Math.floor(Math.random() * products.length)].name,
      old_price: Math.round(old_price),
      new_price: Math.round(new_price),
      change_pct: Math.round(((new_price - old_price) / old_price) * 1000) / 10,
      rationale: rationales[Math.floor(Math.random() * rationales.length)],
      outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
    });
  }
  return logs;
}

function generateDemoRecommendation(productId?: string, products = DEMO_PRODUCTS) {
  const product = products.find((p) => p.product_id === productId) || products[0];
  const yourPrice = product.your_price;
  const recommended = Math.round(yourPrice * (1.02 + Math.random() * 0.08));
  const confidence = 0.78 + Math.random() * 0.17;
  return {
    product_id: product.product_id,
    product_name: product.name,
    current_price: yourPrice,
    recommended_price: recommended,
    floor_price: Math.round(yourPrice * 0.85),
    ceiling_price: Math.round(yourPrice * 1.25),
    confidence,
    margin_impact_pct: Math.round(((recommended - yourPrice) / yourPrice) * 1000) / 10,
    rationale: `Based on ${DEMO_COMPETITORS.length} competitor signals and 90-day trend analysis, a ${Math.round(((recommended - yourPrice) / yourPrice) * 100)}% price increase is recommended. Market median has shifted upward while your win rate remains strong at current positioning.`,
    factors: [
      { name: "Competitor avg price", impact: 0.32, direction: "up" },
      { name: "Market demand trend", impact: 0.24, direction: "up" },
      { name: "Cost base change", impact: 0.18, direction: "down" },
      { name: "Customer segment mix", impact: 0.14, direction: "up" },
      { name: "Seasonal factor", impact: 0.08, direction: "neutral" },
      { name: "Historical win rate", impact: 0.04, direction: "up" },
    ],
  };
}

function generateDemoFeatureImportance() {
  return [
    { feature: "Competitor Avg Price", importance: 0.32, color: "#6366f1" },
    { feature: "Deal Size", importance: 0.22, color: "#8b5cf6" },
    { feature: "Customer Segment", importance: 0.18, color: "#a78bfa" },
    { feature: "Region", importance: 0.12, color: "#c4b5fd" },
    { feature: "Season / Quarter", importance: 0.09, color: "#ddd6fe" },
    { feature: "Historical Win Rate", importance: 0.07, color: "#ede9fe" },
  ];
}

function generateDemoSegments() {
  return [
    { segment: "Enterprise (>1000 emp)", region: "North America", recommended: 2650, current: 2400, delta: "+10.4%", confidence: 0.91 },
    { segment: "Enterprise (>1000 emp)", region: "EMEA", recommended: 2480, current: 2400, delta: "+3.3%", confidence: 0.85 },
    { segment: "Mid-Market (100–1000)", region: "North America", recommended: 1980, current: 1800, delta: "+10.0%", confidence: 0.88 },
    { segment: "Mid-Market (100–1000)", region: "EMEA", recommended: 1850, current: 1800, delta: "+2.8%", confidence: 0.82 },
    { segment: "SMB (<100 emp)", region: "North America", recommended: 890, current: 900, delta: "-1.1%", confidence: 0.76 },
    { segment: "SMB (<100 emp)", region: "APAC", recommended: 750, current: 800, delta: "-6.3%", confidence: 0.71 },
  ];
}

function generateDemoModelAccuracy() {
  const months: any[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      month: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      mape: Math.round((5 + Math.random() * 8) * 10) / 10,
      hit_rate: Math.round((72 + Math.random() * 20) * 10) / 10,
      predictions_count: Math.floor(20 + Math.random() * 60),
    });
  }
  const avgMape = Math.round(months.reduce((s, m) => s + m.mape, 0) / months.length * 10) / 10;
  const avgHit = Math.round(months.reduce((s, m) => s + m.hit_rate, 0) / months.length * 10) / 10;
  return { months, avg_mape: avgMape, avg_hit_rate: avgHit };
}

function generateDemoAlertRules() {
  return [
    { id: "AR-1", name: "Competitor Price Drop", condition: "Any competitor drops price > 5%", channel: "in-app", active: true, created_at: "2025-09-15T10:00:00Z" },
    { id: "AR-2", name: "Margin Below Target", condition: "Margin dips below 15%", channel: "in-app", active: true, created_at: "2025-09-20T14:00:00Z" },
    { id: "AR-3", name: "ML Confidence Drop", condition: "Model confidence falls below 70%", channel: "in-app", active: false, created_at: "2025-10-01T09:00:00Z" },
    { id: "AR-4", name: "Scrape Failure", condition: "Any source fails to scrape for > 24h", channel: "in-app", active: true, created_at: "2025-10-05T11:00:00Z" },
  ];
}

function generateDemoAlertEvents() {
  const now = Date.now();
  return [
    { id: "AE-1", rule_name: "Competitor Price Drop", severity: "high", message: "TechVault dropped Enterprise CRM price by 12%", timestamp: new Date(now - 2 * 3600000).toISOString(), read: false },
    { id: "AE-2", rule_name: "Margin Below Target", severity: "medium", message: "Cloud Storage Pro margin at 13.2% (below 15% target)", timestamp: new Date(now - 8 * 3600000).toISOString(), read: false },
    { id: "AE-3", rule_name: "Competitor Price Drop", severity: "high", message: "DataPrime reduced API Gateway pricing by 7.5%", timestamp: new Date(now - 24 * 3600000).toISOString(), read: true },
    { id: "AE-4", rule_name: "Scrape Failure", severity: "low", message: "CyberEdge scraper returned 403 — retrying", timestamp: new Date(now - 36 * 3600000).toISOString(), read: true },
    { id: "AE-5", rule_name: "ML Confidence Drop", severity: "medium", message: "Model confidence for Security Shield Pro at 62%", timestamp: new Date(now - 48 * 3600000).toISOString(), read: true },
  ];
}

function generateDemoDataFreshness(competitors = DEMO_COMPETITORS) {
  const now = Date.now();
  return competitors.map((comp, i) => {
    const hoursAgo = [1, 3, 12, 28, 72][i] ?? 6;
    return {
      source: comp.name,
      last_scraped: new Date(now - hoursAgo * 3600000).toISOString(),
      status: hoursAgo < 6 ? "green" : hoursAgo < 24 ? "amber" : "red",
      records_count: Math.floor(100 + Math.random() * 500),
    };
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Try to fetch real products; fall back to demo set. */
async function getRealProducts() {
  try {
    // Try to select common variations of column names to avoid failing on schema differences
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*") 
      .order("name", { ascending: true });
      
    if (error || !data || data.length === 0) {
      console.warn("[analytics] Products table empty or error:", error?.message);
      return DEMO_PRODUCTS;
    }
    
    return data.map((p: any) => ({
      id: p.id,
      product_id: p.product_id ?? p.id ?? "Unknown",
      name: p.name || "Untitled Product",
      your_price: Number(p.your_price ?? p.current_price ?? p.price ?? 0),
      category: p.category ?? null,
      sku: p.sku ?? null,
    }));
  } catch (err) {
    console.error("[analytics] getRealProducts failed:", err);
    return DEMO_PRODUCTS;
  }
}

/** Try to fetch real competitors; fall back to demo set. */
async function getRealCompetitors() {
  try {
    const { data, error } = await supabaseAdmin
      .from("competitors")
      .select("id, name")
      .order("name", { ascending: true });
    if (error || !data || data.length === 0) return DEMO_COMPETITORS;
    return data;
  } catch {
    return DEMO_COMPETITORS;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchProductList() {
  return getRealProducts();
}

export async function fetchCompetitorList() {
  return getRealCompetitors();
}

export async function fetchSnapshotKPIs(productId?: string) {
  try {
    const products = await getRealProducts();
    const product = products.find((p) => p.product_id === productId || p.id === productId) ?? products[0];
    const yourPrice = product.your_price;

    // Try fetching latest recommendation for this product
    let recQuery = supabaseAdmin
      .from("recommendations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (product.product_id) {
      recQuery = recQuery.eq("product", product.product_id);
    }

    const { data: recData, error: recError } = await recQuery;
    if (recError) console.warn("[analytics] Error fetching recommendations for KPI:", recError.message);
    const rec = recData?.[0];

    // Try fetching competitor prices for this product to get market median
    const { data: scrapedData, error: scrapedError } = await supabaseAdmin
      .from("scraped_data")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (scrapedError) console.warn("[analytics] Error fetching scraped_data for KPI:", scrapedError.message);

    let marketMedian = Math.round(yourPrice * 0.98);
    if (scrapedData && scrapedData.length > 0) {
      const prices = scrapedData.map((r: any) => Number(r.price)).filter((v) => v > 0);
      if (prices.length > 0) {
        prices.sort((a, b) => a - b);
        marketMedian = prices[Math.floor(prices.length / 2)];
      }
    }

    const recommended = rec?.recommended_price ? Number(rec.recommended_price) : Math.round(yourPrice * 1.05);
    const confidence = rec?.confidence ? Number(rec.confidence) * (Number(rec.confidence) > 1 ? 1 : 100) : 88.5;
    const priceIndex = Math.round((yourPrice / marketMedian) * 100);
    const marginImpact = Math.round(((recommended - yourPrice) / yourPrice) * 1000) / 10;

    return {
      current_price: yourPrice,
      market_median: marketMedian,
      delta_pct: Math.round(((yourPrice - marketMedian) / marketMedian) * 1000) / 10,
      recommended_price: recommended,
      confidence: confidence > 1 ? confidence : Math.round(confidence * 1000) / 10,
      price_index: priceIndex,
      margin_impact_pct: rec?.impact ? Number(rec.impact) : marginImpact,
    };
  } catch {
    const products = await getRealProducts();
    const product = products.find((p) => p.product_id === productId) ?? products[0];
    const yourPrice = product.your_price;
    const marketMedian = Math.round(yourPrice * (0.96 + Math.random() * 0.08));
    const recommended = Math.round(yourPrice * (1.02 + Math.random() * 0.08));
    return {
      current_price: yourPrice,
      market_median: marketMedian,
      delta_pct: Math.round(((yourPrice - marketMedian) / marketMedian) * 1000) / 10,
      recommended_price: recommended,
      confidence: Math.round((80 + Math.random() * 15) * 10) / 10,
      price_index: Math.round((yourPrice / marketMedian) * 100),
      margin_impact_pct: Math.round(((recommended - yourPrice) / yourPrice) * 1000) / 10,
    };
  }
}

export async function fetchCompetitorHeatmap() {
  try {
    const [products, competitors] = await Promise.all([getRealProducts(), getRealCompetitors()]);

    // Try fetching real scraped prices
    const { data: scraped, error } = await supabaseAdmin
      .from("scraped_data")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !scraped || scraped.length === 0) {
      if (error) console.warn("[analytics] Heatmap scraped_data error:", error.message);
      return generateDemoHeatmap(products, competitors);
    }

    // Build a map: competitor_id → product_id → latest price
    const latestMap = new Map<string, Map<string, number>>();
    for (const row of scraped) {
      const cid = String(row.competitor_id);
      const pid = String(row.product_id);
      if (!latestMap.has(cid)) latestMap.set(cid, new Map());
      if (!latestMap.get(cid)!.has(pid)) {
        latestMap.get(cid)!.set(pid, Number(row.price));
      }
    }

    const rows: any[] = [];
    for (const comp of competitors) {
      const cid = String(comp.id);
      const compPrices = latestMap.get(cid) ?? new Map<string, number>();
      const row: any = { competitor: comp.name, competitor_id: comp.id };
      for (const prod of products) {
        const pid = String(prod.product_id);
        const compPrice = compPrices.get(pid) ?? Math.round(prod.your_price * (0.85 + Math.random() * 0.3));
        const delta = Math.round(((compPrice - prod.your_price) / prod.your_price) * 1000) / 10;
        row[pid] = {
          price: compPrice,
          your_price: prod.your_price,
          delta_pct: delta,
          product_name: prod.name,
        };
      }
      rows.push(row);
    }
    return rows;
  } catch {
    const products = await getRealProducts();
    const competitors = await getRealCompetitors();
    return generateDemoHeatmap(products, competitors);
  }
}

export async function fetchMarketDistribution(productId: string) {
  try {
    const products = await getRealProducts();
    const product = products.find((p) => p.product_id === productId || p.id === productId) ?? products[0];
    const yourPrice = product.your_price;

    const { data: scraped, error } = await supabaseAdmin
      .from("scraped_data")
      .select("price")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !scraped || scraped.length === 0) return generateDemoDistribution(productId, products);

    const allPrices = scraped.map((r: any) => Number(r.price)).filter((v) => v > 0);
    allPrices.sort((a, b) => a - b);
    const min = allPrices[0];
    const max = allPrices[allPrices.length - 1];
    const range = max - min || 1;
    const bucketCount = 8;
    const bucketSize = range / bucketCount;

    const buckets = Array.from({ length: bucketCount }, (_, i) => {
      const lo = Math.round(min + i * bucketSize);
      const hi = Math.round(min + (i + 1) * bucketSize);
      const count = allPrices.filter((p) => p >= lo && p < hi).length;
      const isYour = yourPrice >= lo && yourPrice < hi;
      return { price_range: `₹${lo}–₹${hi}`, mid_price: Math.round((lo + hi) / 2), count, is_your_price: isYour };
    });

    const sorted = [...allPrices];
    const yourRank = sorted.filter((p) => p <= yourPrice).length;
    const yourPercentile = Math.round((yourRank / sorted.length) * 100);
    const marketMedian = sorted[Math.floor(sorted.length / 2)];

    return { buckets, your_price: yourPrice, your_percentile: yourPercentile, market_median: marketMedian };
  } catch {
    const products = await getRealProducts();
    return generateDemoDistribution(productId, products);
  }
}

export async function fetchPriceChangeTracker(options?: { limit?: number; threshold?: number }) {
  try {
    const [products, competitors] = await Promise.all([getRealProducts(), getRealCompetitors()]);

    // Try the dedicated recent_events table first
    let q = supabaseAdmin
      .from("recent_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(options?.limit ?? 20);
    const { data: events, error: evErr } = await q;

    if (!evErr && events && events.length > 0) {
      let changes = events.map((r: any) => ({
        id: r.id,
        competitor: r.competitor ?? r.competitor_name,
        product_name: r.product_name ?? r.product,
        product_id: r.product_id,
        old_price: Number(r.old_price),
        new_price: Number(r.new_price),
        change_pct: Number(r.change_pct),
        timestamp: r.timestamp,
      }));
      if (options?.threshold) changes = changes.filter((c) => Math.abs(c.change_pct) >= options.threshold!);
      return changes;
    }

    // Fallback: derive price changes from scraped_data by comparing consecutive entries per (competitor, product)
    const { data: scraped, error: sErr } = await supabaseAdmin
      .from("scraped_data")
      .select("id, product_id, competitor_id, price, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (sErr || !scraped || scraped.length === 0) return generateDemoPriceChanges(products, competitors);

    // Group by (competitor_id, product_id), take consecutive pairs to compute change
    const grouped = new Map<string, any[]>();
    for (const row of scraped) {
      const key = `${row.competitor_id}::${row.product_id}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(row);
    }

    const changes: any[] = [];
    const competitorMap = new Map(competitors.map((c) => [String(c.id), c.name]));

    for (const [, rows] of grouped) {
      if (rows.length < 2) continue;
      const newer = rows[0];
      const older = rows[1];
      const newPrice = Number(newer.price);
      const oldPrice = Number(older.price);
      if (oldPrice === 0) continue;
      const changePct = Math.round(((newPrice - oldPrice) / oldPrice) * 1000) / 10;
      if (options?.threshold && Math.abs(changePct) < options.threshold) continue;

      const productObj = products.find((p) => String(p.id) === String(newer.product_id));
      const productIdStr = productObj ? productObj.product_id : String(newer.product_id);

      changes.push({
        id: newer.id,
        competitor: competitorMap.get(String(newer.competitor_id)) ?? `Competitor ${newer.competitor_id}`,
        product_name: productObj ? productObj.name : `Product ${newer.product_id}`,
        product_id: productIdStr,
        old_price: Math.round(oldPrice),
        new_price: Math.round(newPrice),
        change_pct: changePct,
        timestamp: newer.created_at,
      });
    }

    changes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return changes.slice(0, options?.limit ?? 20);
  } catch {
    const products = await getRealProducts();
    const competitors = await getRealCompetitors();
    return generateDemoPriceChanges(products, competitors);
  }
}

export async function fetchFeatureMatrix() {
  const products = await getRealProducts();
  const competitors = await getRealCompetitors();
  return generateDemoFeatureMatrix(products, competitors);
}

export async function fetchPriceTrend(options?: { days?: number; productId?: string }) {
  try {
    const days = options?.days ?? 90;
    const [products, competitors] = await Promise.all([getRealProducts(), getRealCompetitors()]);
    const fromISO = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

    const product = products.find((p) => p.product_id === options?.productId || p.id === options?.productId) ?? products[0];

    let query = supabaseAdmin
      .from("scraped_data")
      .select("*")
      .gte("created_at", fromISO)
      .order("created_at", { ascending: true });
    if (options?.productId) query = query.eq("product_id", product.id);

    const { data: scraped, error } = await query;

    // Also grab own price history
    let ownQuery = supabaseAdmin
      .from("price_history")
      .select("*")
      .gte("timestamp", fromISO)
      .order("timestamp", { ascending: true });
    if (options?.productId) ownQuery = ownQuery.eq("product_id", product.product_id);
    const { data: ownHistory } = await ownQuery;

    if (error && (!ownHistory || ownHistory.length === 0)) {
      return generateDemoPriceTrend(days, products, competitors);
    }

    const competitorMap = new Map(competitors.map((c) => [String(c.id), c.name]));
    const map = new Map<string, any>();

    // Insert own price from price_history
    if (ownHistory && ownHistory.length > 0) {
      for (const r of ownHistory) {
        const date = new Date(r.timestamp).toISOString().slice(0, 10);
        const point = map.get(date) ?? { date };
        if (r.your_price) point.your_price = Number(r.your_price);
        if (r.competitor && r.competitor_price) point[r.competitor] = Number(r.competitor_price);
        map.set(date, point);
      }
    }

    // Overlay scraped competitor prices
    if (scraped && scraped.length > 0) {
      for (const r of scraped) {
        const date = new Date(r.created_at).toISOString().slice(0, 10);
        const point = map.get(date) ?? { date };
        const compName = competitorMap.get(String(r.competitor_id)) ?? `Comp ${r.competitor_id}`;
        point[compName] = Number(r.price);
        if (!point.your_price) point.your_price = product.your_price;
        map.set(date, point);
      }
    }

    if (map.size === 0) return generateDemoPriceTrend(days, products, competitors);
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    const products = await getRealProducts();
    const competitors = await getRealCompetitors();
    return generateDemoPriceTrend(options?.days ?? 90, products, competitors);
  }
}

export async function fetchElasticity(productId?: string) {
  return generateDemoElasticity();
}

export async function fetchWinLoss() {
  try {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("price_band, status");
    if (error || !data || data.length === 0) return generateDemoWinLoss();
    const bands = ["< ₹1,500", "₹1,500–₹2,000", "₹2,000–₹2,500", "₹2,500–₹3,000", "₹3,000–₹3,500", "> ₹3,500"];
    return bands.map((band) => {
      const wins = data.filter((d: any) => d.price_band === band && d.status === "won").length;
      const losses = data.filter((d: any) => d.price_band === band && d.status === "lost").length;
      return { band, wins, losses, win_rate: wins + losses > 0 ? Math.round((wins / (wins + losses)) * 1000) / 10 : 0 };
    });
  } catch {
    return generateDemoWinLoss();
  }
}

export async function fetchSeasonality() {
  return generateDemoSeasonality();
}

export async function fetchAuditLog() {
  try {
    const { data, error } = await supabaseAdmin
      .from("audit_log")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(20);
    if (error || !data || data.length === 0) {
      const products = await getRealProducts();
      return generateDemoAuditLog(products);
    }
    return data.map((r: any) => ({
      id: r.id,
      timestamp: r.timestamp ?? r.created_at,
      user: r.user_name ?? r.user ?? "System",
      product: r.product_name ?? r.product ?? "—",
      old_price: Number(r.old_price),
      new_price: Number(r.new_price),
      change_pct: Number(r.change_pct),
      rationale: r.rationale ?? "—",
      outcome: r.outcome ?? "Pending",
    }));
  } catch {
    const products = await getRealProducts();
    return generateDemoAuditLog(products);
  }
}

export async function fetchRecommendation(productId?: string) {
  try {
    const products = await getRealProducts();
    const product = products.find((p) => p.product_id === productId || p.id === productId);
    const pid = product ? product.product_id : productId;

    let query = supabaseAdmin
      .from("recommendations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    if (pid) query = query.eq("product", pid);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return generateDemoRecommendation(productId, products);
    }

    const r = data[0];
    const currentPrice = Number(r.current_price ?? r.your_price ?? 0);
    const recommendedPrice = Number(r.recommended_price ?? r.predicted_price ?? 0);
    const rawConf = Number(r.confidence ?? 0);
    // confidence may be stored as 0-1 or 0-100 — normalise to 0-1
    const confidence = rawConf > 1 ? rawConf / 100 : rawConf;

    return {
      product_id: r.product || pid,
      product_name: product ? product.name : (r.product_name ?? r.name ?? "Product"),
      current_price: currentPrice,
      recommended_price: recommendedPrice,
      floor_price: Number(r.floor_price ?? Math.round(currentPrice * 0.85)),
      ceiling_price: Number(r.ceiling_price ?? Math.round(currentPrice * 1.25)),
      confidence,
      margin_impact_pct: Number(r.impact ?? r.margin_impact_pct ?? Math.round(((recommendedPrice - currentPrice) / currentPrice) * 1000) / 10),
      rationale: r.rationale ?? `ML model recommends a price of ₹${recommendedPrice} based on competitor data and demand signals.`,
      factors: r.factors ?? [],
    };
  } catch {
    const products = await getRealProducts();
    return generateDemoRecommendation(productId, products);
  }
}

export async function fetchFeatureImportance(productId?: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("feature_importance")
      .select("feature, importance, color")
      .order("importance", { ascending: false });
    if (error || !data || data.length === 0) return generateDemoFeatureImportance();
    return data.map((r: any, i: number) => ({
      feature: r.feature,
      importance: Number(r.importance),
      color: r.color ?? ["#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#ddd6fe","#ede9fe"][i] ?? "#6366f1",
    }));
  } catch {
    return generateDemoFeatureImportance();
  }
}

export async function fetchSegmentRecommendations() {
  try {
    const { data, error } = await supabaseAdmin
      .from("recommendations")
      .select("segment, region, recommended_price, current_price, confidence")
      .not("segment", "is", null)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error || !data || data.length === 0) return generateDemoSegments();
    return data.map((r: any) => {
      const cur = Number(r.current_price ?? 0);
      const rec = Number(r.recommended_price ?? 0);
      const changePct = cur > 0 ? Math.round(((rec - cur) / cur) * 1000) / 10 : 0;
      const rawConf = Number(r.confidence ?? 0);
      return {
        segment: r.segment,
        region: r.region ?? "Global",
        recommended: rec,
        current: cur,
        delta: `${changePct >= 0 ? "+" : ""}${changePct}%`,
        confidence: rawConf > 1 ? rawConf / 100 : rawConf,
      };
    });
  } catch {
    return generateDemoSegments();
  }
}

export async function fetchModelAccuracy() {
  try {
    const { data, error } = await supabaseAdmin
      .from("model_accuracy")
      .select("*")
      .order("id", { ascending: false });
    if (error || !data || data.length === 0) return generateDemoModelAccuracy();
    const months = data.map((r: any) => ({
      month: r.month ?? r.period ?? new Date(r.created_at).toLocaleString("default", { month: "short", year: "2-digit" }),
      mape: Number(r.mape ?? r.error_rate ?? 0),
      hit_rate: Number(r.hit_rate ?? r.accuracy ?? 0),
      predictions_count: Number(r.predictions_count ?? 0),
    }));
    const avgMape = Math.round(months.reduce((s, m) => s + m.mape, 0) / months.length * 10) / 10;
    const avgHit = Math.round(months.reduce((s, m) => s + m.hit_rate, 0) / months.length * 10) / 10;
    return { months, avg_mape: avgMape, avg_hit_rate: avgHit };
  } catch {
    return generateDemoModelAccuracy();
  }
}

export async function fetchAlertRules() {
  try {
    const { data, error } = await supabaseAdmin.from("alert_rules").select("*").order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return generateDemoAlertRules();
    return data;
  } catch {
    return generateDemoAlertRules();
  }
}

export async function fetchAlertEvents() {
  try {
    const { data, error } = await supabaseAdmin
      .from("alert_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(50);
    if (error || !data || data.length === 0) return generateDemoAlertEvents();
    return data;
  } catch {
    return generateDemoAlertEvents();
  }
}

export async function fetchDataFreshness() {
  try {
    const { data, error } = await supabaseAdmin.from("data_freshness").select("*");
    if (error || !data || data.length === 0) {
      const competitors = await getRealCompetitors();
      return generateDemoDataFreshness(competitors);
    }
    return data;
  } catch {
    const competitors = await getRealCompetitors();
    return generateDemoDataFreshness(competitors);
  }
}

export async function simulatePrice(input: {
  productId: string;
  proposedPrice: number;
  costPrice?: number;
  competitorPrices?: number[];
}) {
  const products = await getRealProducts();
  const product = products.find((p) => p.product_id === input.productId) ?? products[0];
  const cost = input.costPrice ?? product.your_price * 0.6;
  const margin = ((input.proposedPrice - cost) / input.proposedPrice) * 100;
  const priceDelta = ((input.proposedPrice - product.your_price) / product.your_price) * 100;
  const baseWinProb = 65;
  const winProb = Math.max(10, Math.min(95, baseWinProb - priceDelta * 1.5));
  const monthlyVolume = Math.round(100 * (winProb / baseWinProb));
  return {
    proposed_price: input.proposedPrice,
    win_probability: Math.round(winProb * 10) / 10,
    estimated_margin_pct: Math.round(margin * 10) / 10,
    estimated_monthly_revenue: Math.round(input.proposedPrice * monthlyVolume),
    estimated_monthly_volume: monthlyVolume,
    market_position: priceDelta > 5 ? "Premium" : priceDelta < -5 ? "Undercut" : "Competitive",
  };
}
