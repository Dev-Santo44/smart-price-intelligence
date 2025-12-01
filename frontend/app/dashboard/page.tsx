"use client";
import React, { useState, useEffect } from "react";
import KPICard from './components/KPICard';
import PriceChart from './components/PriceChart';
import RecommendationList from './components/RecommendationList';
import QuickActions from './components/QuickActions';
import RecentPricesTable from './components/RecentPricesTable';
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch dashboard data
  const fetchDashboardData = async (pageNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard?page=${pageNum}&pageSize=${pageSize}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(page);
  }, [page]);

  // Handle recommendation actions
  const handleRecommendationAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/recommendations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Failed to update recommendation");

      // Refresh dashboard data after action
      fetchDashboardData(page);
    } catch (err) {
      console.error("Error updating recommendation:", err);
      // Optional: Show error toast
    }
  };

  const onAccept = (rec: any) => handleRecommendationAction(rec.id, "accept");
  const onReject = (rec: any) => handleRecommendationAction(rec.id, "reject");
  const onView = (row: any) => router.push(`/dashboard/${encodeURIComponent(row.product_id)}`);

  if (isLoading && !data) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-rose-600">{error}</div>;
  if (!data) return null;

  const { kpis, priceSeries, recent, recommendations, total } = data;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pricing Dashboard</h1>
          <div className="text-sm text-slate-500">Overview & quick actions</div>
        </div>
        <div className="flex items-center gap-4">
          <input className="px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-800" placeholder="Search products, categories..." />
          <div className="text-sm text-slate-500">Last sync: {new Date().toLocaleDateString()}</div>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        <section className="col-span-12 grid grid-cols-4 gap-4">
          {kpis.map((k: any) => (<KPICard key={k.id} title={k.title} value={k.value} delta={k.delta} />))}
        </section>

        <section className="col-span-8 space-y-4">
          <PriceChart series={priceSeries} />
          <RecentPricesTable rows={recent} onView={onView} />
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-slate-500">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border">Next</button>
            </div>
          </div>
        </section>

        <aside className="col-span-4 space-y-4">
          <QuickActions />
          <RecommendationList items={recommendations} onAccept={onAccept} onReject={onReject} />
        </aside>
      </main>
    </div>
  );
}
