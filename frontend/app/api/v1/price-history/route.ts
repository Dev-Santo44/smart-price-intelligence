// app/api/v1/price-history/route.ts
import { NextResponse } from "next/server";
import { getPriceHistory } from "@/lib/server/db/priceHistory";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("product_id");
    if (!productId) return NextResponse.json({ error: "product_id is required" }, { status: 400 });

    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;
    const granularity = (url.searchParams.get("granularity") as "hourly" | "daily") ?? "daily";

    const points = await getPriceHistory({ productId, from, to, granularity });
    return NextResponse.json({ points });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
