// app/api/recommendations/[id]/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request, context: { params: any }) {
    try {
        // MUST await params before using them
        const { id } = await context.params;

        const body = await request.json().catch(() => ({}));
        const action = (String(body.action || "accept")).toLowerCase();

        // Mock processing — replace with real DB/ML call
        const result = {
            id,
            action,
            status: action === "accept" ? "applied" : "rejected",
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json({ ok: true, result }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
}
