// app/api/scraped-products/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// simple helper to return consistent error responses
function errorResponse(message = "Server error", status = 500) {
    return NextResponse.json({ error: message }, { status });
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    // Note: This runs at module load time — helpful for dev to fail fast.
    // In production you may prefer to lazy-check inside the handler.
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

/**
 * GET /api/scraped-products
 * Optional query params:
 *  - limit (number) default 100
 *  - offset (number) default 0
 *
 * Returns: [{ product_id, product_name }]
 */
export async function GET(request: Request) {
    try {
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            return errorResponse("Supabase configuration missing on server.", 500);
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            // do not expose this client to the browser
            // set global options if you want (timeouts, etc.)
        });

        const url = new URL(request.url);
        const limitParam = url.searchParams.get("limit");
        const offsetParam = url.searchParams.get("offset");
        const limit = limitParam ? Math.max(1, Math.min(1000, Number(limitParam))) : 100;
        const offset = offsetParam ? Math.max(0, Number(offsetParam)) : 0;

        // Adjust table/column names to your schema if necessary.
        // We expect a table named 'scraped_products' with at least columns:
        // - product_id (string/uuid)
        // - product_name (string)
        // - updated_at or created_at (timestamp) for ordering

        // Fetch products with join to get product names
        const { data, error, status } = await supabase
            .from("scraped_data")
            .select(`
                product_id,
                created_at,
                products!inner(name)
            `)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Supabase error:", error);
            return errorResponse(`Supabase error: ${error.message}`, status || 500);
        }

        if (!Array.isArray(data)) {
            return errorResponse("Unexpected data format from database.", 500);
        }

        // Normalize and dedupe by product_id (in case table has multiple rows per product)
        const seen = new Set();
        const products = [];
        for (const row of data) {
            const pid = (row as any).product_id ?? (row as any).id ?? null;
            // Access the joined product name from products table
            // When using !inner join, products is an object with the selected fields
            const pname = (row as any).products?.name ?? null;
            if (!pid || !pname) continue;
            if (seen.has(pid)) continue;
            seen.add(pid);
            products.push({ product_id: String(pid), product_name: String(pname) });
        }

        return NextResponse.json(products, { status: 200 });
    } catch (err: any) {
        console.error("API error in /api/scraped-products:", err);
        return errorResponse(err?.message || String(err), 500);
    }
}
