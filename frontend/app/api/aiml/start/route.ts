// app/api/aiml/start/route.ts
import { NextResponse } from "next/server";

const ML_API_BASE_URL = process.env.ML_API_BASE_URL || "https://smart-pricing-platform.onrender.com";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { product_id } = body;

        if (!product_id) {
            return NextResponse.json(
                { message: "Missing product_id in request body" },
                { status: 400 }
            );
        }

        console.log(`Starting AI/ML model for product: ${product_id}`);

        // Call the FastAPI ML model endpoint
        const mlApiUrl = `${ML_API_BASE_URL}/run-model/${product_id}`;

        console.log(`Calling ML API: ${mlApiUrl}`);

        const mlResponse = await fetch(mlApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(300000), // 5 minutes timeout
        });

        if (!mlResponse.ok) {
            const errorText = await mlResponse.text();
            console.error(`ML API error (${mlResponse.status}):`, errorText);

            return NextResponse.json(
                {
                    message: `ML model API returned error: ${mlResponse.status}`,
                    error: errorText,
                },
                { status: mlResponse.status }
            );
        }

        const mlResult = await mlResponse.json();

        console.log(`ML model completed successfully for product ${product_id}`);
        console.log("ML Result:", mlResult);

        return NextResponse.json(
            {
                message: "AI/ML model completed successfully",
                product_id: product_id,
                result: mlResult,
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("Error running AI/ML model:", err);

        // Check if it's a timeout error
        if (err.name === "TimeoutError" || err.name === "AbortError") {
            return NextResponse.json(
                {
                    message: "ML model execution timed out. The model may still be running in the background.",
                    error: "Request timeout after 5 minutes",
                },
                { status: 504 }
            );
        }

        return NextResponse.json(
            {
                message: "Failed to run AI/ML model",
                error: err.message || String(err),
            },
            { status: 500 }
        );
    }
}
