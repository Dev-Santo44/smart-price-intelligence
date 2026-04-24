// lib/server/db/modelOutput.ts
import { supabaseAdmin } from "../supabaseAdmin";

export type PredictionPoint = {
    ts: string; // ISO
    predicted_price: number;
    confidence: number;
};

type GetPredictionsArgs = {
    productId: string;
    limit?: number;
};

/**
 * Fetch model predictions for a specific product from the model_output table.
 */
export async function getModelPredictions({
    productId,
    limit = 30,
}: GetPredictionsArgs): Promise<PredictionPoint[]> {
    if (!productId) {
        throw new Error("productId is required");
    }

    // Assuming model_output has product_id, predicted_price, confidence, and timestamp/created_at
    const { data, error } = await supabaseAdmin
        .from("model_output")
        .select("timestamp, predicted_price, confidence, product_id") // adjust if column names differ
        .eq("product_id", productId)
        .order("timestamp", { ascending: true })
        .limit(limit);

    if (error) {
        // If table doesn't exist yet, we might want to return mock data for development
        // but for now we follow the user's assumption that it exists.
        console.warn(`Supabase fetch model_output failed: ${error.message}`);

        // Fallback to empty if table is missing to avoid crashing the UI
        if (error.code === 'PGRST116' || error.message.includes('not found')) {
            return [];
        }
        throw error;
    }

    const rows: any[] = data ?? [];

    return rows.map(r => ({
        ts: r.timestamp || new Date().toISOString(),
        predicted_price: Number(r.predicted_price ?? r.price ?? 0),
        confidence: Number(r.confidence ?? 0),
    }));
}
