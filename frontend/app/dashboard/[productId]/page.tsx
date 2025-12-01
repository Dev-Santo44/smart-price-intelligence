"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductDetails() {
  const params = useParams();
  const id = params?.productId as string | undefined;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id!)}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || result.message || "Failed to load product");
        }

        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Unable to load product.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!id) {
    return <div className="p-6">Invalid product id.</div>;
  }

  if (isLoading) return <div className="p-6">Loading product...</div>;

  if (error) {
    return <div className="p-6 text-rose-600">{error}</div>;
  }

  // `data` here is the product row returned by the API
  const product = data;

  if (!product || Object.keys(product).length === 0) {
    return <div className="p-6">Product not found.</div>;
  }

  // map DB column names to UI-friendly variables
  const displayName = product.name ?? product.title ?? "Untitled";
  const productId = product.product_id ?? product.productId ?? "—";
  const description = product.description ?? product.desc ?? "";
  // your_price might be the stored field
  const cost = product.your_price ?? product.cost ?? 0;
  const msrp = product.msrp ?? product.list_price ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-3 py-1 rounded border hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        ← Back
      </button>
      <div className="bg-white/80 dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{displayName}</h2>
        <div className="text-sm text-slate-500 mb-4">Product ID: {productId}</div>
        {description ? <p className="mb-4">{description}</p> : null}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Cost</div>
            <div className="font-medium">₹{Number(cost).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">MSRP</div>
            <div className="font-medium">₹{Number(msrp).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
