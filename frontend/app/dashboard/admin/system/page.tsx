"use client";

import React, { useEffect, useState } from "react";

type ProductOption = { product_id: string; product_name: string };

export default function AdminSystemPage() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [scraperChoice, setScraperChoice] = useState("");
  const [scrapedProducts, setScrapedProducts] = useState<ProductOption[]>([]);
  const [aimlChoice, setAimlChoice] = useState("");
  const [addProduct, setAddProduct] = useState("");

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingScraped, setLoadingScraped] = useState(false);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [aimlRunning, setAimlRunning] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchScraped();
  }, []);

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`${res.status}`);
      const raw = await res.json();
      const arr: ProductOption[] = (Array.isArray(raw) ? raw : []).map((p: any) => ({
        product_id: p.product_id || p.id,
        product_name: p.product_name || p.name || p.product_id,
      }));
      setProducts(arr);
      if (arr.length > 0) setScraperChoice(prev => prev || arr[0].product_id);
    } catch (e: any) {
      setMessage({ type: "error", text: `Could not load products: ${e.message}` });
    } finally {
      setLoadingProducts(false);
    }
  }

  async function fetchScraped() {
    setLoadingScraped(true);
    try {
      const res = await fetch("/api/scraped-products");
      if (!res.ok) throw new Error(`${res.status}`);
      const arr = await res.json();
      setScrapedProducts(Array.isArray(arr) ? arr : []);
      if (Array.isArray(arr) && arr.length > 0) {
        setAimlChoice(prev => prev || arr[0].product_id);
        setAddProduct(prev => prev || arr[0].product_id);
      }
    } catch (e: any) {
      setMessage({ type: "error", text: `Could not load scraped products: ${e.message}` });
    } finally {
      setLoadingScraped(false);
    }
  }

  async function handleStartScraper() {
    if (!scraperChoice) { setMessage({ type: "error", text: "Please select a product." }); return; }
    setScraperRunning(true);
    setMessage({ type: "info", text: "🕷️ Generating synthetic competitor price data…" });
    try {
      const res = await fetch("/api/scraper/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: scraperChoice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
      setMessage({ type: "success", text: `✅ ${data.message} — ${data.rows_inserted} price rows inserted across ${data.competitors_scraped} competitors.` });
      setTimeout(fetchScraped, 1200);
    } catch (e: any) {
      setMessage({ type: "error", text: `Scraper failed: ${e.message}` });
    } finally {
      setScraperRunning(false);
    }
  }

  async function handleStartAIML() {
    if (!aimlChoice) { setMessage({ type: "error", text: "Please select a scraped product." }); return; }
    setAimlRunning(true);
    setMessage({ type: "info", text: "🤖 Running AI/ML model — generating recommendation and price history…" });
    try {
      const res = await fetch("/api/aiml/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: aimlChoice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
      const r = data.result?.recommendation;
      const summary = r
        ? `Recommended price: $${r.recommended_price} (confidence ${r.confidence}%) — ${r.direction} from current $${r.current_price}`
        : "Model run complete.";
      setMessage({ type: "success", text: `✅ ${data.message}. ${summary}` });
    } catch (e: any) {
      setMessage({ type: "error", text: `AI/ML failed: ${e.message}` });
    } finally {
      setAimlRunning(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!addProduct) {
      setMessage({ type: "error", text: "Please select a product before uploading." });
      e.target.value = "";
      return;
    }
    setUploading(true);
    setMessage({ type: "info", text: "Parsing file…" });
    try {
      const { read, utils } = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = utils.sheet_to_json(sheet, { defval: null });
      if (!rows.length) throw new Error("No rows in file.");
      setMessage({ type: "info", text: `Uploading ${rows.length} rows…` });
      const res = await fetch("/api/aiml/upload-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: addProduct, data: rows, metadata: { file: file.name } }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || `HTTP ${res.status}`);
      setMessage({ type: "success", text: `✅ Uploaded ${rows.length} rows for product ${addProduct}.` });
      setTimeout(fetchScraped, 800);
    } catch (e: any) {
      setMessage({ type: "error", text: `Upload failed: ${e.message}` });
    } finally {
      setUploading(false);
      const inp = document.getElementById("aiml-file-input") as HTMLInputElement;
      if (inp) inp.value = "";
    }
  }

  const msgStyle =
    message?.type === "error"   ? "bg-red-50 border-red-200 text-red-800" :
    message?.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
    "bg-blue-50 border-blue-200 text-blue-800";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">System — Scraper &amp; AI/ML Engines</h1>
      <p className="text-sm text-slate-500 mb-5">
        Generate synthetic competitor pricing data and AI/ML recommendations for any product — no external APIs required.
      </p>

      {message && (
        <div className={`mb-5 p-3 rounded-lg border text-sm ${msgStyle}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-3 opacity-60 hover:opacity-100 font-bold">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── LEFT: Scraper ── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🕷️</span>
            <h2 className="text-lg font-semibold">Scraper Engine</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Generates realistic competitor price data for the selected product and saves it to the database.
            Prices are synthesised across all 7 competitors with 60 days of historical trend data.
          </p>

          <label className="block text-sm font-medium mb-1">Select product to scrape</label>
          {loadingProducts ? (
            <div className="text-sm text-slate-400 mb-4">Loading products…</div>
          ) : (
            <select
              value={scraperChoice}
              onChange={e => setScraperChoice(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-sm mb-4"
            >
              {products.length === 0 && <option value="">No products found</option>}
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_name} — {p.product_id}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartScraper}
              disabled={scraperRunning || loadingProducts || !scraperChoice}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
            >
              {scraperRunning ? "⏳ Running…" : "▶ Start Scraper"}
            </button>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              ↻ Refresh list
            </button>
          </div>

          {scraperRunning && (
            <div className="mt-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg p-3 text-xs text-indigo-700 dark:text-indigo-300">
              Generating 60 days × 7 competitors of price data. This takes a moment…
            </div>
          )}
        </section>

        {/* ── RIGHT: AI/ML ── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-semibold">AI / ML Engine</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Runs the pricing model for a scraped product. Generates a recommendation with rationale,
            90 days of price history, and updates model accuracy metrics.
          </p>

          {/* Upload section */}
          <div className="mb-5 border border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-slate-50 dark:bg-slate-900">
            <h3 className="text-sm font-semibold mb-2">📂 Upload Historical Data (optional)</h3>
            <p className="text-xs text-slate-500 mb-3">
              Upload a spreadsheet (XLSX / CSV) to add product-specific historical data before running the model.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Product</label>
                <select
                  value={addProduct}
                  onChange={e => setAddProduct(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                >
                  {products.length === 0 && <option value="">No products</option>}
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Spreadsheet file</label>
                <input
                  id="aiml-file-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="w-full text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => document.getElementById("aiml-file-input")?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                {uploading ? "⏳ Uploading…" : "⬆ Upload spreadsheet"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const inp = document.getElementById("aiml-file-input") as HTMLInputElement;
                  if (inp) inp.value = "";
                  setMessage(null);
                }}
                className="px-3 py-2 border border-slate-200 dark:border-slate-600 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={fetchScraped}
                className="px-3 py-2 border border-slate-200 dark:border-slate-600 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 ml-auto"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Start AIML */}
          <label className="block text-sm font-medium mb-1">Select scraped product to run AI/ML</label>
          {loadingScraped ? (
            <div className="text-sm text-slate-400 mb-3">Loading scraped products…</div>
          ) : (
            <select
              value={aimlChoice}
              onChange={e => setAimlChoice(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-sm mb-4"
            >
              {scrapedProducts.length === 0 && <option value="">No scraped data — run the scraper first</option>}
              {scrapedProducts.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_name} — {p.product_id}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartAIML}
              disabled={aimlRunning || !aimlChoice}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
            >
              {aimlRunning ? "⏳ Running model…" : "▶ Start AI/ML Engine"}
            </button>
            <button
              onClick={fetchScraped}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              ↻ Refresh scraped list
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            The model generates pricing recommendations, 90-day price history, and updates model accuracy metrics.
            Results appear immediately in Pricing Analytics.
          </p>
        </section>
      </div>
    </div>
  );
}
