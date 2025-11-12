"use client";

import React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

const queryClient = new QueryClient();

async function fetchProduct(id: string) {
  // axios will throw for non-2xx responses; we catch and rethrow a clearer error
  const res = await axios.get(`/api/products/${encodeURIComponent(id)}`);
  const data = res.data;

  // if your API returns { error: '...' } on failure, normalize into a thrown error
  if (data && typeof data === "object" && ("error" in data)) {
    throw new Error(data.error || "Failed to load product");
  }

  // The API returns the product object directly (not { product })
  return data;
}

function ProductDetails() {
  const params = useParams();
  // note: dynamic segment name must match your folder [productId] => productId
  const id = params?.productId as string | undefined;
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery(
    ["product", id],
    () => fetchProduct(id!),
    {
      enabled: !!id,       // only run when id is available
      retry: false,        // optional: avoid automatic retries during debugging
      suspense: false,
    }
  );

  if (!id) {
    return <div className="p-6">Invalid product id.</div>;
  }

  if (isLoading) return <div className="p-6">Loading product...</div>;

  if (isError) {
    // axios errors can be nested, so show helpful info if available
    let message = "Unable to load product.";
    if (error && (error as any).response && (error as any).response.data) {
      const d = (error as any).response.data;
      message = d.error ?? JSON.stringify(d);
    } else if (error instanceof Error) {
      message = error.message;
    }
    return <div className="p-6 text-rose-600">{message}</div>;
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

export default function ProductPageClient() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductDetails />
    </QueryClientProvider>
  );
}
