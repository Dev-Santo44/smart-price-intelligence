// lib/server/db/priceHistory.ts
import { supabaseAdmin } from "../supabaseAdmin";

export type PricePoint = {
  ts: string; // ISO
  price: number;
};

type GetPriceHistoryArgs = {
  productId: string;
  from?: string; // ISO date
  to?: string; // ISO date
  granularity?: "hourly" | "daily";
};

function normalizeIso(dateOrIso?: string) {
  if (!dateOrIso) return undefined;
  // If the user passed a plain date like '2025-10-01' keep it, else ensure it's ISO.
  const d = new Date(dateOrIso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/**
 * Fetch price history rows and aggregate into daily/hourly average points.
 * This implementation is tolerant to different column names for price.
 */
export async function getPriceHistory({
  productId,
  from,
  to,
  granularity = "daily",
}: GetPriceHistoryArgs): Promise<PricePoint[]> {
  if (!productId) {
    throw new Error("productId is required");
  }

  const fromISO = normalizeIso(from) ?? new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const toISO = normalizeIso(to) ?? new Date().toISOString();

  // Fetch rows. We use select('*') to avoid errors if a specific price column is missing.
  const { data, error } = await supabaseAdmin
    .from("price_history")
    .select("timestamp,your_price,product_id")
    .eq("product_id", productId)
    .gte("timestamp", fromISO)
    .lte("timestamp", toISO)
    .order("timestamp", { ascending: true });

  if (error) {
    // Helpful error for debugging
    error.message = `Supabase fetch price_history failed: ${error.message}`;
    throw error;
  }

  const rows: any[] = data ?? [];

  // Map for aggregation: key -> { sum, count }
  const map = new Map<string, { sum: number; count: number }>();

  for (const r of rows) {
    if (!r || !r.timestamp) continue;

    // tolerant price extraction: check common possible column names
    const rawVal = r.your_price ?? r.price ?? r.value ?? null;
    const num = Number(rawVal);

    if (Number.isNaN(num)) {
      // skip rows with non-numeric price
      continue;
    }

    const d = new Date(r.timestamp);
    if (Number.isNaN(d.getTime())) continue;

    const key = granularity === "hourly" ? d.toISOString().slice(0, 13) : d.toISOString().slice(0, 10);
    const agg = map.get(key) ?? { sum: 0, count: 0 };
    agg.sum += num;
    agg.count += 1;
    map.set(key, agg);
  }

  const points: PricePoint[] = Array.from(map.entries())
    .map(([k, v]) => {
      const ts = granularity === "hourly" ? `${k}:00:00Z` : `${k}T00:00:00Z`;
      return { ts, price: v.sum / v.count };
    })
    .sort((a, b) => (a.ts < b.ts ? -1 : 1));

  return points;
}
