// app/api/aiml/upload-data/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { product_id, data, metadata } = body;

        if (!product_id || !Array.isArray(data)) {
            return NextResponse.json({ message: "Invalid payload. Expect product_id and data array." }, { status: 400 });
        }

        // TODO: authorize (admin-only) — ensure only admins can modify product data

        await saveProductDataToDB(product_id, data, metadata);

        return NextResponse.json({ message: "Uploaded data saved to product", rows: data.length }, { status: 200 });
    } catch (err: any) {
        console.error("upload-data error", err);
        return NextResponse.json({ message: "Server error", error: err.message || String(err) }, { status: 500 });
    }
}

async function saveProductDataToDB(product_id: string, data: any[], metadata: any) {
    // Import Supabase client
    const { createClient } = await import("@supabase/supabase-js");

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Store all data in a single row with JSONB data column
    // Check if a record exists for this product_id
    const { data: existing, error: fetchError } = await supabase
        .from("scraped_data")
        .select("id, data")
        .eq("product_id", product_id)
        .limit(1)
        .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error checking existing data:", fetchError);
        throw new Error(`Failed to check existing data: ${fetchError.message}`);
    }

    if (existing) {
        // Update existing record - replace data
        const { error: updateError } = await supabase
            .from("scraped_data")
            .update({
                data: data, // Replace with new data (or merge if needed)
                updated_at: new Date().toISOString(),
            })
            .eq("product_id", product_id);

        if (updateError) {
            console.error("Error updating data:", updateError);
            throw new Error(`Failed to update data: ${updateError.message}`);
        }

        console.log(`Updated ${data.length} rows for product ${product_id}`);
    } else {
        // Insert new record
        const { error: insertError } = await supabase
            .from("scraped_data")
            .insert({
                product_id: product_id,
                data: data,
                metadata: metadata,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

        if (insertError) {
            console.error("Error inserting data:", insertError);
            throw new Error(`Failed to insert data: ${insertError.message}`);
        }

        console.log(`Inserted ${data.length} rows for product ${product_id}`);
    }
}
