'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KPICard from './components/KPICard';
import PriceChart from './components/PriceChart';
import RecommendationList from './components/RecommendationList';
import QuickActions from './components/QuickActions';
import RecentPricesTable from './components/RecentPricesTable';
import { useDashboardData } from './../hooks/useDashboardData';


const queryClient = new QueryClient();


function DashboardContent() {
  const { data, isLoading, error } = useDashboardData();


  if (isLoading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-rose-600">Unable to load dashboard data.</div>;


  const { kpis, priceSeries, recent, recommendations } = data;


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
        {/* KPI row */}
        <section className="col-span-12 grid grid-cols-4 gap-4">
          {kpis.map(k => (<KPICard key={k.id} title={k.title} value={k.value} delta={k.delta} />))}
        </section>


        {/* Main charts & lists */}
        <section className="col-span-8 space-y-4">
          <PriceChart series={priceSeries} />
          <RecentPricesTable rows={recent} />
        </section>


        {/* Right column */}
        <aside className="col-span-4 space-y-4">
          <QuickActions />
          <RecommendationList items={recommendations} />
        </aside>
      </main>


      <footer className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} Smart Pricing — demo data shown. Replace API endpoints with your FastAPI backend.</footer>
    </div>
  );
}


export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}