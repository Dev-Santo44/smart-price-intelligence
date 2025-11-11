// lib/server/db/products.ts
import { supabaseAdmin } from "../supabaseAdmin";

export type ProductRow = {
    id: string;
    name: string;
    sku: string;
    category: string | null;
    current_price: number;
    updated_at: string;
    // add fields you need
};

export async function getProducts({
    q,
    category,
    page = 1,
    perPage = 25,
    sort = "name",
}: {
    q?: string | null;
    category?: string | null;
    page?: number;
    perPage?: number;
    sort?: string;
}) {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabaseAdmin
        .from<ProductRow>("products")
        .select("id,name,sku,category,current_price,updated_at", { count: "exact" })
        .range(from, to);

    if (q) {
        // full text / ilike search (example)
        query = query.ilike("name", `%${q}%`);
    }
    if (category) {
        query = query.eq("category", category);
    }

    // simple sort handling; validate sort server-side
    if (sort === "price") query = query.order("current_price", { ascending: true });
    else query = query.order("name", { ascending: true });

    const { data, error, count } = await query;

    if (error) throw error;
    return { items: data ?? [], total: count ?? 0 };
}

export async function getProductById(productId: string) {
    const { data, error } = await supabaseAdmin
        .from<ProductRow>("products")
        .select("id,name,sku,category,current_price,updated_at")
        .eq("id", productId)
        .single();

    if (error) throw error;
    return data;
}
