import { NextResponse } from 'next/server';


let STORE = [
    { id: '1', product_id: 'P-1001', name: 'Wireless Headphones X1', your_price: 96.5, timestamp: '2025-11-01T10:00:00Z', domain: 'example.com' },
    { id: '2', product_id: 'P-1002', name: 'Portable Speaker S7', your_price: 45.0, timestamp: '2025-11-03T09:30:00Z', domain: 'example.com' },
];


export async function GET() {
    return NextResponse.json(STORE);
}


export async function POST(req: any) {
    try {
        const body = await req.json();
        // validate required fields
        const { product_id, name, your_price, timestamp, domain } = body;
        if (!product_id || !name || your_price === undefined || !timestamp) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const item = { id: String(Date.now()), product_id, name, your_price: Number(your_price), timestamp, domain: domain || null };
        STORE = [item, ...STORE];
        return NextResponse.json(item, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}