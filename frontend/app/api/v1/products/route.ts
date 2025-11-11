// app/api/v1/products/route.ts
import { NextResponse } from "next/server";
import { getProducts } from "@/lib/server/db/products";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const category = url.searchParams.get("category");
    const page = Number(url.searchParams.get("page") ?? 1);
    const perPage = Number(url.searchParams.get("per_page") ?? 25);
    const sort = url.searchParams.get("sort") ?? "name";

    const { items, total } = await getProducts({ q, category, page, perPage, sort });

    return NextResponse.json({ items, total, page, perPage });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
