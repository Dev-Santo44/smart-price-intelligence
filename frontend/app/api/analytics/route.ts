// app/api/analytics/route.ts
import { NextResponse } from "next/server";
import {
  fetchProductList,
  fetchCompetitorList,
  fetchSnapshotKPIs,
  fetchCompetitorHeatmap,
  fetchMarketDistribution,
  fetchPriceChangeTracker,
  fetchFeatureMatrix,
  fetchPriceTrend,
  fetchElasticity,
  fetchWinLoss,
  fetchSeasonality,
  fetchAuditLog,
  fetchRecommendation,
  fetchFeatureImportance,
  fetchSegmentRecommendations,
  fetchModelAccuracy,
  fetchAlertRules,
  fetchAlertEvents,
  fetchDataFreshness,
  simulatePrice,
} from "@/lib/server/db/analytics";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const section = url.searchParams.get("section") || "all";
    const productId = url.searchParams.get("productId") || undefined;
    const days = parseInt(url.searchParams.get("days") || "90");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const threshold = parseFloat(url.searchParams.get("threshold") || "0");

    switch (section) {
      case "products":
        return NextResponse.json(await fetchProductList());
      case "competitors":
        return NextResponse.json(await fetchCompetitorList());
      case "kpis":
        return NextResponse.json(await fetchSnapshotKPIs(productId));
      case "heatmap":
        return NextResponse.json(await fetchCompetitorHeatmap());
      case "distribution":
        return NextResponse.json(await fetchMarketDistribution(productId || "P-1001"));
      case "price-changes":
        return NextResponse.json(await fetchPriceChangeTracker({ limit, threshold }));
      case "feature-matrix":
        return NextResponse.json(await fetchFeatureMatrix());
      case "trend":
        return NextResponse.json(await fetchPriceTrend({ days, productId }));
      case "elasticity":
        return NextResponse.json(await fetchElasticity(productId));
      case "win-loss":
        return NextResponse.json(await fetchWinLoss());
      case "seasonality":
        return NextResponse.json(await fetchSeasonality());
      case "audit-log":
        return NextResponse.json(await fetchAuditLog());
      case "recommendation":
        return NextResponse.json(await fetchRecommendation(productId));
      case "feature-importance":
        return NextResponse.json(await fetchFeatureImportance(productId));
      case "segments":
        return NextResponse.json(await fetchSegmentRecommendations());
      case "model-accuracy":
        return NextResponse.json(await fetchModelAccuracy());
      case "alert-rules":
        return NextResponse.json(await fetchAlertRules());
      case "alert-events":
        return NextResponse.json(await fetchAlertEvents());
      case "data-freshness":
        return NextResponse.json(await fetchDataFreshness());
      default:
        return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Analytics API error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// POST /api/analytics  — used for scenario simulation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, proposedPrice, costPrice, competitorPrices } = body;
    if (!productId || !proposedPrice) {
      return NextResponse.json({ error: "productId and proposedPrice are required" }, { status: 400 });
    }
    const result = await simulatePrice({ productId, proposedPrice, costPrice, competitorPrices });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Analytics POST error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
