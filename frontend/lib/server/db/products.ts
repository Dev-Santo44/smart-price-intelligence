// lib/server/db/products.ts
import { supabaseAdmin } from "../supabaseAdmin";

export type ProductRow = {
    id: string;
    product_id: string;
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
            "id,product_id,name,sku,category,your_price,updated_at",
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
        query = query.order("your_price", { ascending: true });
    } else {
        query = query.order("name", { ascending: true });
    }

    // Apply typing only on output (no functionality changed)
    const { data, error, count } = await query as unknown as {
        data: any[];
        error: any;
        count: number;
    };

    if (error) throw error;
    
    const items: ProductRow[] = (data ?? []).map(p => ({
        id: p.id,
        product_id: p.product_id ?? p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        current_price: Number(p.your_price ?? p.current_price ?? 0),
        updated_at: p.updated_at
    }));

    return { items, total: count ?? 0 };
}

export async function getProductById(productId: string) {
    const { data, error } = await supabaseAdmin
        .from("products")
        .select("id,product_id,name,sku,category,your_price,updated_at")
        .or(`product_id.eq.${productId},id.eq.${productId}`)
        .single() as unknown as {
            data: any;
            error: any;
        };

    if (error) throw error;
    if (!data) return null;

    const row: ProductRow = {
        id: data.id,
        product_id: data.product_id ?? data.id,
        name: data.name,
        sku: data.sku,
        category: data.category,
        current_price: Number(data.your_price ?? data.current_price ?? 0),
        updated_at: data.updated_at
    };
    return row;
}
