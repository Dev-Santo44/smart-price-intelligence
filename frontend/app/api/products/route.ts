// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/server/supabaseAdmin'; // adjust path if needed

function safeMask(str: string | undefined | null) {
    if (!str) return null;
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
}

async function fetchByProductId(productId: any) {
    // fetch a single product by business product_id
    return supabaseAdmin.from('products').select('*').eq('product_id', productId).limit(1).maybeSingle();
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const pathname = url.pathname || '';
        const pathSegments = pathname.replace(/\/+$/, '').split('/'); // split and trim trailing slash
        // pathSegments example: ['', 'api', 'products', 'P-1003']
        const diag = url.searchParams.get('diag');

        // Diagnostic mode
        if (diag === '1' && (!pathSegments[3] || pathSegments[3] === '')) {
            console.log('[DIAG] Running supabase test select...');
            const { data, error } = await supabaseAdmin.from('products').select('id,product_id').limit(1);
            console.log('[DIAG] select result:', { error });
            return NextResponse.json({
                ok: !error,
                message: error ? 'Select failed' : 'Select succeeded',
                sample: data || [],
                env: {
                    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL : null,
                    SUPABASE_SERVICE_ROLE_KEY_MASKED: process.env.SUPABASE_SERVICE_ROLE_KEY ? safeMask(process.env.SUPABASE_SERVICE_ROLE_KEY) : null,
                },
            });
        }

        // If request path contains an extra segment after /api/products, treat that as product_id
        if (pathSegments.length >= 4 && pathSegments[3]) {
            const rawId = pathSegments[3];
            const productId = decodeURIComponent(rawId);
            console.log(`GET single product by path product_id=${productId}`);

            const { data, error } = await fetchByProductId(productId);
            if (error) {
                console.error('GET single product error', error);
                return NextResponse.json({ error: error.message || 'DB error' }, { status: 500 });
            }
            if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(data);
        }

        // Query-style single product: /api/products?product_id=...
        const productIdQuery = url.searchParams.get('product_id');
        if (productIdQuery) {
            const productId = productIdQuery;
            console.log(`GET single product by query product_id=${productId}`);
            const { data, error } = await fetchByProductId(productId);
            if (error) {
                console.error('GET /api/products by product_id error:', error);
                return NextResponse.json({ error: error.message || 'DB error' }, { status: 500 });
            }
            if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(data);
        }

        // Otherwise: list products
        const domain = url.searchParams.get('domain');
        let q = supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });
        if (domain) q = q.eq('domain', domain);

        const { data, error } = await q;
        console.log('GET /api/products ->', { error });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Map the data to include product_name for frontend compatibility
        const mappedData = (data || []).map(product => ({
            ...product,
            product_name: product.name, // Map 'name' to 'product_name'
        }));

        return NextResponse.json(mappedData);
    } catch (err: any) {
        console.error('GET /api/products unexpected', err);
        return NextResponse.json({ error: err.message || 'Unexpected' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const raw = await req.text();
        console.log('POST /api/products raw body length', raw ? raw.length : 0);
        if (!raw || !raw.trim()) {
            return NextResponse.json({ error: 'Empty body' }, { status: 400 });
        }

        let body;
        const ct = (req.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('application/json')) {
            try {
                body = JSON.parse(raw);
            } catch (e) {
                console.error('Invalid JSON:', e);
                return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
            }
        } else {
            // try to parse urlencoded or fallback json
            try {
                body = JSON.parse(raw);
            } catch {
                body = Object.fromEntries(new URLSearchParams(raw).entries());
            }
        }

        const rows = Array.isArray(body) ? body : [body];

        // sanitize / coerce
        const sanitized = rows.map((r: any) => ({
            product_id: String(r.product_id ?? r.productId ?? '').trim(),
            name: String(r.name ?? '').trim(),
            your_price: Number(r.your_price ?? r.price ?? 0),
            timestamp: new Date(String(r.timestamp ?? r.time ?? '')).toISOString(),
            domain: r.domain ? String(r.domain).trim() : null,
        }));

        console.log('Attempting insert of', sanitized);

        const { data, error } = await supabaseAdmin.from('products').insert(sanitized).select();

        console.log('Supabase insert response', { error, data });

        if (error) {
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }
        return NextResponse.json({ inserted: data }, { status: 201 });
    } catch (err: any) {
        console.error('POST unexpected', err);
        return NextResponse.json({ error: err.message || 'Unexpected' }, { status: 500 });
    }
}
