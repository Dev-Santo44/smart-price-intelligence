// app/api/products/[productId]/predictions/route.ts
import { NextResponse } from 'next/server';
import { getModelPredictions } from '@/lib/server/db/modelOutput';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;

        if (!productId) {
            return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
        }

        const predictions = await getModelPredictions({ productId });

        return NextResponse.json(predictions);
    } catch (err: any) {
        console.error('API GET predictions error:', err);
        return NextResponse.json(
            { error: err.message || 'Server error' },
            { status: 500 }
        );
    }
}
