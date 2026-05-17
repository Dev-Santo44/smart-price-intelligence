// app/api/scraper/start/route.ts
// Synthetic scraper — generates realistic competitor price data for the selected product
// and persists it to Supabase so all analytics dashboards reflect real-looking data.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

const COMPETITORS = [
  { id: "C-001", name: "BrandZ" },
  { id: "C-002", name: "AlphaCo" },
  { id: "C-003", name: "NovaTech" },
  { id: "C-004", name: "PrimeSys" },
  { id: "C-005", name: "CoreEdge" },
  { id: "C-006", name: "StellarGear" },
  { id: "C-007", name: "ApexSound" },
];

function randFloat(min: number, max: number, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json({ message: "Missing product_id" }, { status: 400 });
    }

    // ── 1. Resolve product UUID + price ──────────────────────────────────────
    const { data: productRows, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, product_id, name, your_price")
      .or(`product_id.eq.${product_id},id.eq.${product_id}`)
      .limit(1);

    if (prodErr || !productRows || productRows.length === 0) {
      return NextResponse.json(
        { message: `Product not found: ${product_id}` },
        { status: 404 }
      );
    }

    const product = productRows[0];
    const productUUID = product.id;           // UUID for scraped_data FK
    const productTextId = product.product_id; // text e.g. "P-1001"
    const basePrice = Number(product.your_price) || 100;

    // ── 2. Load existing competitors (merge with defaults) ───────────────────
    const { data: dbComps } = await supabaseAdmin
      .from("competitors")
      .select("id, name");
    const competitors = (dbComps && dbComps.length > 0) ? dbComps : COMPETITORS;

    // ── 3. Upsert competitors so they exist in DB ────────────────────────────
    await supabaseAdmin
      .from("competitors")
      .upsert(COMPETITORS, { onConflict: "id" });

    // ── 4. Delete old scraped_data rows for this product ─────────────────────
    await supabaseAdmin
      .from("scraped_data")
      .delete()
      .eq("product_id", productUUID);

    // ── 5. Generate synthetic scraped rows ───────────────────────────────────
    const TIME_POINTS = [0, 3, 7, 14, 21, 30, 45, 60];
    const scrapedRows: any[] = [];

    for (const comp of competitors) {
      // Each competitor has a consistent bias (some always cheaper, some pricier)
      const biasSeed = (comp.id.charCodeAt(comp.id.length - 1) % 7) - 3; // -3 to +3
      const biasMultiplier = 1 + biasSeed * 0.03; // ±9%

      for (const daysBack of TIME_POINTS) {
        // Skip some (competitor, day) combinations for realistic sparsity
        if (Math.random() < 0.2) continue;

        // Market movement trend: slightly cheaper further back in time
        const trendFactor = 1 + (daysBack / TIME_POINTS[TIME_POINTS.length - 1]) * -0.04;
        const noiseRange = basePrice * 0.08; // ±8% random noise
        const price = randFloat(
          basePrice * biasMultiplier * trendFactor - noiseRange / 2,
          basePrice * biasMultiplier * trendFactor + noiseRange / 2
        );

        scrapedRows.push({
          product_id: productUUID,
          competitor_id: comp.id,
          price: Math.max(price, 1), // guard against negatives
          created_at: daysAgo(daysBack),
          scraped_at: daysAgo(daysBack),
        });
      }
    }

    const { error: insertErr } = await supabaseAdmin
      .from("scraped_data")
      .insert(scrapedRows);

    if (insertErr) {
      console.error("[scraper] scraped_data insert error:", insertErr.message);
      return NextResponse.json(
        { message: "Failed to insert scraped data", error: insertErr.message },
        { status: 500 }
      );
    }

    // ── 6. Generate recent_events ────────────────────────────────────────────
    const recentRows: any[] = [];
    const pickedComps = competitors.slice(0, 3);

    for (const comp of pickedComps) {
      const oldPrice = randFloat(basePrice * 0.88, basePrice * 1.1);
      const changePct = randFloat(-10, 10);
      const newPrice = parseFloat((oldPrice * (1 + changePct / 100)).toFixed(2));
      recentRows.push({
        product_id: productTextId,
        product_name: product.name,
        competitor: comp.name,
        old_price: oldPrice,
        new_price: newPrice,
        change_pct: changePct,
        timestamp: daysAgo(Math.floor(Math.random() * 14)),
      });
    }

    // Remove old recent_events for this product then insert new ones
    await supabaseAdmin
      .from("recent_events")
      .delete()
      .eq("product_id", productTextId);

    await supabaseAdmin.from("recent_events").insert(recentRows);

    return NextResponse.json(
      {
        message: `Scraper complete for ${product.name}`,
        product_id: productTextId,
        rows_inserted: scrapedRows.length,
        competitors_scraped: competitors.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[scraper/start] error:", err);
    return NextResponse.json(
      { message: "Scraper failed", error: err.message || String(err) },
      { status: 500 }
    );
  }
}
