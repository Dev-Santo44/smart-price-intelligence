// lib/server/db/products.ts
import { supabaseAdmin } from "../supabaseAdmin";

export type ProductRow = {
    id: string;
    name: string;
    sku: string;
    category: string | null;
    current_price: number;
    updated_at: string;
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
        .from("products")
        .select(
            "id,name,sku,category,current_price,updated_at",
            { count: "exact" }
        )
        .range(from, to);

    if (q) {
        query = query.ilike("name", `%${q}%`);
    }

    if (category) {
        query = query.eq("category", category);
    }

    if (sort === "price") {
        query = query.order("current_price", { ascending: true });
    } else {
        query = query.order("name", { ascending: true });
    }

    // Apply typing only on output (no functionality changed)
    const { data, error, count } = await query as unknown as {
        data: ProductRow[];
        error: any;
        count: number;
    };

    if (error) throw error;
    return { items: data ?? [], total: count ?? 0 };
}

export async function getProductById(productId: string) {
    const { data, error } = await supabaseAdmin
        .from("products")
        .select("id,name,sku,category,current_price,updated_at")
        .eq("product_id", productId)
        .single() as unknown as {
            data: ProductRow;
            error: any;
        };

    if (error) throw error;
    return data;
}
