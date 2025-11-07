// app/api/products/[productId]/route.ts
import { NextResponse } from "next/server";

const PRODUCTS: Record<string, any> = {
  "P-1001": { product_id: "P-1001", name: "Wireless Headphones X1", description: "Top-tier sound, ANC", cost: 70.0, msrp: 129.0 },
  "P-1002": { product_id: "P-1002", name: "Smart Speaker Plus", description: "Voice assistant enabled", cost: 85.0, msrp: 149.0 },
  "P-1003": { product_id: "P-1003", name: "Fitness Band A2", description: "Heart-rate + sleep tracking", cost: 20.0, msrp: 59.0 }
};

export async function GET(request: Request, context: { params: any }) {
  try {
    // IMPORTANT: await params before using it
    const { productId } = await context.params;
    const product = PRODUCTS[productId] ?? null;

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}
