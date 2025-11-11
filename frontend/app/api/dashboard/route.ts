
// // app/api/dashboard/route.js
// import { NextResponse } from "next/server";

// const ALL_RECENT = [
//     { product_id: "P-1001", name: "Wireless Headphones X1", your_price: 96.5, competitor: "BrandZ", competitor_price: 98.7, change_pct: -2.3, timestamp: "2025-10-30T10:15:00Z" },
//     { product_id: "P-1002", name: "Smart Speaker Plus", your_price: 129.0, competitor: "EchoMax", competitor_price: 125.0, change_pct: 3.1, timestamp: "2025-10-29T09:12:00Z" },
//     { product_id: "P-1003", name: "Fitness Band A2", your_price: 45.5, competitor: "FitPro", competitor_price: 47.0, change_pct: -1.5, timestamp: "2025-10-28T14:00:00Z" },
//     // add more mock rows to see pagination in action
//     { product_id: "P-1004", name: "Camera C100", your_price: 199.0, competitor: "CamPro", competitor_price: 202.5, change_pct: -1.7, timestamp: "2025-10-27T11:00:00Z" },
//     { product_id: "P-1005", name: "Laptop L5", your_price: 899.0, competitor: "NoteMax", competitor_price: 879.0, change_pct: 2.3, timestamp: "2025-10-26T08:10:00Z" },
//     { product_id: "P-1006", name: "Smartwatch S9", your_price: 149.9, competitor: "WristX", competitor_price: 152.0, change_pct: -1.4, timestamp: "2025-10-25T16:20:00Z" }
// ];

// export async function GET(req: any) {
//     const url = new URL(req.url);
//     const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
//     const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") || "3")));
//     const start = (page - 1) * pageSize;
//     const end = start + pageSize;
//     const paged = ALL_RECENT.slice(start, end);

//     const KPIS = [
//         { id: "products", title: "Products Monitored", value: 1256, delta: 3.4 },
//         { id: "competitors", title: "Active Competitors", value: 24, delta: -1.2 },
//         { id: "recommendations", title: "Pending Recommendations", value: 18, delta: 5.1 },
//         { id: "opportunities", title: "Pricing Opportunities", value: 9, delta: 12.3 }
//     ];

//     const PRICE_SERIES = [
//         { date: "2025-10-01", your: 99.0, competitor: 101.2 },
//         { date: "2025-10-10", your: 98.9, competitor: 99.6 },
//         { date: "2025-10-20", your: 96.8, competitor: 100.0 },
//         { date: "2025-10-30", your: 96.5, competitor: 98.7 }
//     ];

//     const RECOMMENDATIONS = [
//         { id: "R-2001", product: "Wireless Headphones X1", impact: "+1.2% margin", priority: "High", confidence: 0.92 },
//         { id: "R-2002", product: "Smart Speaker Plus", impact: "+0.8% margin", priority: "Medium", confidence: 0.78 },
//         { id: "R-2003", product: "Fitness Band A2", impact: "+2.5% margin", priority: "Low", confidence: 0.66 }
//     ];

//     return NextResponse.json({
//         kpis: KPIS,
//         priceSeries: PRICE_SERIES,
//         recent: paged,
//         total: ALL_RECENT.length,
//         page,
//         pageSize,
//         recommendations: RECOMMENDATIONS
//     });
// }
















// app/api/dashboard/route.js
import { NextResponse } from "next/server";
import {
    fetchRecentEvents,
    fetchKPIs,
    fetchPriceSeries,
    fetchRecommendations,
    insertRecentEvent
} from "@/lib/server/db/dashboard";

export async function GET(req:any) {
    try {
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
        const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") || "10")));

        // Parallel fetches for performance
        const [recentRes, kpis, priceSeries, recommendations] = await Promise.all([
            fetchRecentEvents({ page, pageSize }),
            fetchKPIs(),
            fetchPriceSeries({ days: 30 }), // default 30-day series
            fetchRecommendations({ limit: 10 })
        ]);

        return NextResponse.json({
            kpis,
            priceSeries,
            recent: recentRes.items,
            total: recentRes.total,
            page,
            pageSize,
            recommendations
        });
    } catch (err:any) {
        console.error("dashboard GET error:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}

export async function POST(req: any) {
    // Accept a single event payload and insert into recent_events
    try {
        const body = await req.json();

        // Basic validation – extend as needed
        const required = ["product_id", "name", "your_price", "competitor", "competitor_price", "timestamp"];
        for (const k of required) {
            if (!body[k]) {
                return NextResponse.json({ error: `${k} is required` }, { status: 400 });
            }
        }

        const event = {
            product_id: body.product_id,
            name: body.name,
            your_price: body.your_price,
            competitor: body.competitor,
            competitor_price: body.competitor_price,
            change_pct: body.change_pct ?? null,
            timestamp: body.timestamp
        };

        const inserted = await insertRecentEvent(event);

        // Optionally: invalidate cache / notify realtime subscribers here

        return NextResponse.json({ inserted }, { status: 201 });
    } catch (err: any) {
        console.error("dashboard POST error:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
