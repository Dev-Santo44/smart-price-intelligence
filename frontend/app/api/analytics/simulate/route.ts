// app/api/analytics/simulate/route.ts
import { NextResponse } from "next/server";
import { simulatePrice } from "@/lib/server/db/analytics";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, proposedPrice, costPrice, competitorPrices } = body;

    if (!productId || proposedPrice === undefined) {
      return NextResponse.json(
        { error: "productId and proposedPrice are required" },
        { status: 400 }
      );
    }

    const result = await simulatePrice({
      productId,
      proposedPrice: Number(proposedPrice),
      costPrice: costPrice ? Number(costPrice) : undefined,
      competitorPrices: competitorPrices || [],
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Simulate API error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
