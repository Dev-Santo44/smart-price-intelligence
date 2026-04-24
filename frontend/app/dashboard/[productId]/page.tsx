"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PredictionChart from "../components/PredictionChart";

export default function ProductDetails() {
  const params = useParams();
  const id = params?.productId as string | undefined;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const [prodRes, predRes] = await Promise.all([
          fetch(`/api/products/${encodeURIComponent(id!)}`),
          fetch(`/api/products/${encodeURIComponent(id!)}/predictions`)
        ]);

        const productResult = await prodRes.json();

        if (!prodRes.ok) {
          throw new Error(productResult.error || productResult.message || "Failed to load product");
        }

        let predResult: any[] = [];
        if (predRes.ok) {
          predResult = await predRes.json();
        }

        if (isMounted) {
          setData(productResult);
          setPredictions(predResult);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Unable to load product detail.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white/80 dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-1">{displayName}</h2>
          <div className="text-xs text-slate-500 mb-6 flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded uppercase tracking-wider font-bold text-[10px]">SKU</span>
            {productId}
          </div>

          {description ? <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{description}</p> : null}

          <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Our Price</div>
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">₹{Number(cost).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">MSRP</div>
              <div className="text-lg font-medium text-slate-400 line-through decoration-rose-500/30">₹{Number(msrp).toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Latest Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Predicted Price</span>
                <span className="text-sm font-semibold">
                  {predictions.length > 0 ? `₹${predictions[predictions.length - 1].predicted_price.toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">AI Confidence</span>
                <span className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(predictions.length > 0 ? predictions[predictions.length - 1].confidence * 100 : 0)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-emerald-500">
                    {predictions.length > 0 ? `${(predictions[predictions.length - 1].confidence * 100).toFixed(0)}%` : '—'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <PredictionChart data={predictions} />

          <div className="bg-white/80 dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Market Position</h3>
            <p className="text-sm text-slate-500 italic">Historical market positioning data will be visualized here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
