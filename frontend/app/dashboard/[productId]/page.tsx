"use client";

import React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

const queryClient = new QueryClient();

function fetchProduct(id: string) {
  return axios.get(`/api/products/${encodeURIComponent(id)}`).then((r) => r.data);
}

function ProductDetails() {
  const params = useParams();
  const id = params?.productId as string;
  const router = useRouter();

  const { data, isLoading, error } = useQuery(["product", id], () => fetchProduct(id), { enabled: !!id });

  if (isLoading) return <div className="p-6">Loading product...</div>;
  if (error) return <div className="p-6 text-rose-600">Unable to load product.</div>;

  const { product } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-3 py-1 rounded border hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        ← Back
      </button>
      <div className="bg-white/80 dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{product.name}</h2>
        <div className="text-sm text-slate-500 mb-4">Product ID: {product.product_id}</div>
        <p className="mb-4">{product.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Cost</div>
            <div className="font-medium">${product.cost}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">MSRP</div>
            <div className="font-medium">${product.msrp}</div>
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
