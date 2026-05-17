// app/api/scraped-products/route.ts
// Returns list of products that have scraped data. Uses products table for name lookup.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

function errorResponse(message = "Server error", status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    // Get distinct product UUIDs from scraped_data
    const { data: scraped, error: scrapedErr } = await supabaseAdmin
      .from("scraped_data")
      .select("product_id")
      .not("product_id", "is", null)
      .order("product_id");

    if (scrapedErr) {
      console.error("scraped_data error:", scrapedErr.message);
      return errorResponse(`Supabase error: ${scrapedErr.message}`);
    }

    if (!scraped || scraped.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Deduplicate UUIDs
    const uniqueUUIDs = [...new Set(scraped.map((r: any) => String(r.product_id)).filter(Boolean))];

    // Resolve UUIDs to product names
    const { data: products, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, product_id, name")
      .in("id", uniqueUUIDs);

    if (prodErr) {
      console.error("products lookup error:", prodErr.message);
      return errorResponse(`Products lookup error: ${prodErr.message}`);
    }

    const result = (products || []).map((p: any) => ({
      product_id: p.product_id || p.id,
      product_name: p.name,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("API error in /api/scraped-products:", err);
    return errorResponse(err?.message || String(err));
  }
}
