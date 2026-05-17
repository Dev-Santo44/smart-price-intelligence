// app/api/aiml/upload-data/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, data, metadata } = body;

    if (!product_id || !Array.isArray(data)) {
      return NextResponse.json({ message: "Invalid payload. Expect product_id and data array." }, { status: 400 });
    }

    // Resolve text product_id to UUID for scraped_data FK
    const { data: productRows, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, product_id, name")
      .or(`product_id.eq.${product_id},id.eq.${product_id}`)
      .limit(1);

    if (prodErr || !productRows || productRows.length === 0) {
      return NextResponse.json(
        { message: `Product not found: ${product_id}` },
        { status: 404 }
      );
    }

    const product = productRows[0];
    const productUUID = product.id;

    // Store the uploaded data as a single metadata/jsonb record
    const { data: existing } = await supabaseAdmin
      .from("scraped_data")
      .select("id")
      .eq("product_id", productUUID)
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("scraped_data")
        .update({ data: data, metadata: metadata })
        .eq("product_id", productUUID);
    } else {
      await supabaseAdmin.from("scraped_data").insert({
        product_id: productUUID,
        data: data,
        metadata: metadata,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { message: "Uploaded data saved to product", rows: data.length },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("upload-data error", err);
    return NextResponse.json({ message: "Server error", error: err.message || String(err) }, { status: 500 });
  }
}
