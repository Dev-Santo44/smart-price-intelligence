// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from './../../../../lib/server/supabaseAdmin'; // adjust path to your lib

// simple UUID v4 check
const isUUID = (s: any): boolean => {
  if (!s || typeof s !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
};

// helper to resolve id: prefer params.id, else fallback to ?product_id=...
async function resolveId(req: Request, params: any): Promise<string | null> {
  const resolved = await params;
  const paramId = resolved?.productId;
  if (paramId) return paramId;
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('product_id') ?? url.searchParams.get('id');
    if (q) return q;
  } catch (e) {
    // ignore
  }
  return null;
}

export async function GET(req: Request, { params }: { params: any }) {
  try {
    const idParam = await resolveId(req, params);
    if (!idParam) return NextResponse.json({ error: 'Missing id parameter (pass in path or ?product_id=...)' }, { status: 400 });

    if (isUUID(idParam)) {
      const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', idParam).maybeSingle();
      if (error) return NextResponse.json({ error: error.message || 'DB error' }, { status: 500 });
      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabaseAdmin.from('products').select('*').eq('product_id', idParam).limit(1).maybeSingle();
      if (error) return NextResponse.json({ error: error.message || 'DB error' }, { status: 500 });
      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.error('GET single product unexpected', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const idParam = await resolveId(req, params);
    if (!idParam) return NextResponse.json({ error: 'Missing id parameter (pass in path or ?product_id=...)' }, { status: 400 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 });

    const updates: any = {};
    if (body.product_id !== undefined) updates.product_id = String(body.product_id).trim();
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.your_price !== undefined) updates.your_price = Number(body.your_price);
    if (body.timestamp !== undefined) {
      const ts = new Date(String(body.timestamp));
      if (isNaN(ts.getTime())) return NextResponse.json({ error: 'Invalid timestamp' }, { status: 400 });
      updates.timestamp = ts.toISOString();
    }
    if (body.domain !== undefined) updates.domain = body.domain ? String(body.domain).trim() : null;

    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });

    let res;
    if (isUUID(idParam)) {
      res = await supabaseAdmin.from('products').update(updates).eq('id', idParam).select().maybeSingle();
    } else {
      res = await supabaseAdmin.from('products').update(updates).eq('product_id', idParam).select();
    }

    if (res.error) return NextResponse.json({ error: res.error.message || 'DB error' }, { status: 500 });
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('PUT single product unexpected', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const idParam = await resolveId(req, params);
    if (!idParam) return NextResponse.json({ error: 'Missing id parameter (pass in path or ?product_id=...)' }, { status: 400 });

    let res;
    if (isUUID(idParam)) {
      res = await supabaseAdmin.from('products').delete().eq('id', idParam).select();
    } else {
      res = await supabaseAdmin.from('products').delete().eq('product_id', idParam).select();
    }

    if (res.error) return NextResponse.json({ error: res.error.message || 'DB error' }, { status: 500 });
    if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ removed: res.data });
  } catch (err: any) {
    console.error('DELETE single product unexpected', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
