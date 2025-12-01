"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
/**
 * System Admin page for:
 *  - Left: Scraper Engine (choose product -> start scraper)
 *  - Right: AI/ML Engine (add historical data, choose product -> start AIML)
 *
 * Usage:
 *  - Place in app/dashboard/admin/system/page.tsx (App Router) or pages/... (Pages Router)
 *  - Ensure Tailwind is enabled
 *  - Adjust API endpoints in the constants below to match your backend routes
 */

/* CONFIG: change these to your real endpoints */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const PRODUCTS_ENDPOINT = `${API_BASE}/api/products`; // returns product list for scraper choices -> [{ product_id, product_name }]
const SCRAPED_PRODUCTS_ENDPOINT = `${API_BASE}/api/scraped-products/`; // returns scraped data products -> [{ product_id, product_name }]
const START_SCRAPER_ENDPOINT = `${API_BASE}/api/scraper/start`; // POST { product_id }
const START_AIML_ENDPOINT = `${API_BASE}/api/aiml/start`; // POST { product_id }
const ADD_AIML_DATA_ENDPOINT = `${API_BASE}/api/aiml/add-data`; // POST { product_id, date, value, notes }
const UPLOAD_AIML_DATA_ENDPOINT = `${API_BASE}/api/aiml/upload-data`;

type ProductOption = {
    product_id: string;
    product_name: string;
};

export default function AdminSystemPage() {
    // Scraper state
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [scraperChoice, setScraperChoice] = useState<string>("");

    // AIML state
    const [scrapedProducts, setScrapedProducts] = useState<ProductOption[]>([]);
    const [aimlChoice, setAimlChoice] = useState<string>("");

    // Add data form (for AIML)
    const [addProduct, setAddProduct] = useState<string>("");


    const [fileParsing, setFileParsing] = useState(false);
    const [uploading, setUploading] = useState(false);


    // UI/loading
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingScrapedProducts, setLoadingScrapedProducts] = useState(false);
    const [scraperRunning, setScraperRunning] = useState(false);
    const [aimlRunning, setAimlRunning] = useState(false);
    const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchProducts();
        fetchScrapedProducts();
    }, []);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!addProduct) {
            setMessage({ type: "error", text: "Please select a product before uploading a file." });
            // clear input so user can re-select
            e.target.value = "";
            return;
        }

        setFileParsing(true);
        setMessage({ type: "info", text: "Parsing file..." });

        try {
            // read file into ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });

            // take first sheet by default
            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheetName];

            // convert to JSON objects (header row => keys)
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });

            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                setMessage({ type: "error", text: "Parsed file contains no rows." });
                setFileParsing(false);
                e.target.value = "";
                return;
            }

            // optional normalization step could go here (date strings, numeric coercion, column rename, etc.)

            setMessage({ type: "info", text: `Uploading ${jsonData.length} rows...` });
            setUploading(true);

            const res = await fetch(UPLOAD_AIML_DATA_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: addProduct,
                    data: jsonData,
                    metadata: { originalFileName: file.name, sheetName: firstSheetName, rowCount: jsonData.length },
                }),
            });

            const resJson = await res.json();
            if (!res.ok) throw new Error(resJson?.message || `Upload failed (${res.status})`);

            setMessage({ type: "success", text: `Uploaded ${jsonData.length} rows for product ${addProduct}.` });

            // refresh scraped products/existing data list (optional)
            fetchScrapedProducts();
        } catch (err: any) {
            console.error("file upload error", err);
            setMessage({ type: "error", text: `Failed to parse/upload file: ${err?.message || err}` });
        } finally {
            setFileParsing(false);
            setUploading(false);
            // clear file input
            const input = document.getElementById("aiml-file-input") as HTMLInputElement;
            if (input) input.value = "";
        }
    }

    // Fetch product choices (for Scraper)
    async function fetchProducts() {
        setLoadingProducts(true);
        try {
            const res = await fetch(PRODUCTS_ENDPOINT);
            if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
            const data = await res.json();
            // Expecting array of { product_id, product_name }
            setProducts(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length > 0) {
                setScraperChoice(prev => prev || data[0].product_id);
            }
        } catch (err: any) {
            console.error("fetchProducts err", err);
            setMessage({ type: "error", text: "Could not load product list. Check PRODUCTS_ENDPOINT." });
        } finally {
            setLoadingProducts(false);
        }
    }

    // Fetch scraped product choices (for AIML)
    async function fetchScrapedProducts() {
        setLoadingScrapedProducts(true);
        try {
            const res = await fetch(SCRAPED_PRODUCTS_ENDPOINT);
            if (!res.ok) throw new Error(`Failed to fetch scraped products (${res.status})`);
            const data = await res.json();
            setScrapedProducts(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length > 0) {
                setAimlChoice(prev => prev || data[0].product_id);
                setAddProduct(prev => prev || data[0].product_id);
            }
        } catch (err: any) {
            console.error("fetchScrapedProducts err", err);
            setMessage({ type: "error", text: "Could not load scraped product list. Check SCRAPED_PRODUCTS_ENDPOINT." });
        } finally {
            setLoadingScrapedProducts(false);
        }
    }

    // Start scraper for selected product
    async function handleStartScraper() {
        if (!scraperChoice) {
            setMessage({ type: "error", text: "Please choose a product to scrape." });
            return;
        }
        setScraperRunning(true);
        setMessage({ type: "info", text: "Starting scraper..." });
        try {
            const res = await fetch(START_SCRAPER_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: scraperChoice }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || `Scraper API returned ${res.status}`);
            setMessage({ type: "success", text: `Scraper started for product ${scraperChoice}.` });
            // Optionally refresh scraped products after a small delay
            setTimeout(fetchScrapedProducts, 1500);
        } catch (err: any) {
            console.error("startScraper err", err);
            setMessage({ type: "error", text: `Failed to start scraper: ${err.message || err}` });
        } finally {
            setScraperRunning(false);
        }
    }

    // Start AIML engine for selected product
    async function handleStartAIML() {
        if (!aimlChoice) {
            setMessage({ type: "error", text: "Please choose a scraped product for AIML." });
            return;
        }
        setAimlRunning(true);
        setMessage({ type: "info", text: "Starting AI/ML engine... This may take a few minutes." });
        try {
            const res = await fetch(START_AIML_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: aimlChoice }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || `AIML API returned ${res.status}`);

            // Show success message with result details
            const resultMessage = data.result
                ? `AI/ML model completed successfully! ${JSON.stringify(data.result).substring(0, 100)}...`
                : `AI/ML model completed successfully for product ${aimlChoice}!`;

            setMessage({ type: "success", text: resultMessage });
        } catch (err: any) {
            console.error("startAIML err", err);
            setMessage({ type: "error", text: `Failed to run AI/ML model: ${err.message || err}` });
        } finally {
            setAimlRunning(false);
        }
    }

    // Add new historical/product-specific data for AIML (stores to DB)


    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">System — Scraper & AI/ML Engines</h1>

            {/* global message */}
            {message && (
                <div
                    className={`mb-4 p-3 rounded border ${message.type === "error" ? "bg-red-50 border-red-200 text-red-800" : message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-blue-50 border-blue-200 text-blue-800"
                        }`}
                >
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT: Scraper Engine */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
                    <h2 className="text-lg font-medium mb-3">Scraper Engine</h2>

                    <div className="text-sm mb-4">
                        <p className="mb-2">
                            The Scraper Engine triggers the scraping flow for a single selected product. Choose one product below and press <strong>Start Scraper</strong>.
                        </p>
                        <p className="text-xs text-slate-500">
                            The choice list is loaded from your products table (column: product_name / product_id). The scraper API will be called with the selected product ID.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Select product to scrape</label>
                            <div className="mt-1">
                                {loadingProducts ? (
                                    <div className="text-sm text-slate-500">Loading products...</div>
                                ) : (
                                    <select
                                        value={scraperChoice}
                                        onChange={(e) => setScraperChoice(e.target.value)}
                                        className="w-full rounded-md border p-2"
                                        aria-label="Select product to scrape"
                                    >
                                        {products.length === 0 && <option value="">No products found</option>}
                                        {products.map((p) => (
                                            <option key={p.product_id} value={p.product_id}>
                                                {p.product_name} — {p.product_id}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleStartScraper}
                                disabled={scraperRunning || loadingProducts || !scraperChoice}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {scraperRunning ? "Starting..." : "Start Scraper"}
                            </button>
                            <button
                                onClick={fetchProducts}
                                className="inline-flex items-center px-3 py-2 border rounded-lg"
                            >
                                Refresh list
                            </button>
                        </div>
                    </div>
                </section>

                {/* RIGHT: AI/ML Engine */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
                    <h2 className="text-lg font-medium mb-3">AI / ML Engine</h2>

                    /* 1) Add data section — (Excel upload) */
                    <div className="mb-5 border rounded-md p-4">
                        <h3 className="font-semibold mb-2">Add product-specific / historical data</h3>
                        <p className="text-sm text-slate-500 mb-3">Upload a spreadsheet (XLSX / XLS / CSV). The first sheet will be converted to JSON and saved into the product's data field in the DB.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm block mb-1">Product</label>
                                <select value={addProduct} onChange={(e) => setAddProduct(e.target.value)} className="w-full p-2 border rounded-md">
                                    {loadingScrapedProducts ? (
                                        <option>Loading...</option>
                                    ) : scrapedProducts.length === 0 ? (
                                        <option value="">No scraped products available</option>
                                    ) : (
                                        scrapedProducts.map((p) => (
                                            <option key={p.product_id} value={p.product_id}>
                                                {p.product_name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm block mb-1">Spreadsheet file</label>
                                <input
                                    id="aiml-file-input"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                    className="w-full"
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center gap-2 mt-2">
                                <button
                                    type="button"
                                    disabled={fileParsing || uploading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                                    onClick={() => {
                                        // no-op: upload happens when selecting a file; this keeps UI behavior like the previous "Add data" button
                                        // but remains clickable for accessibility (shows status via disabled state)
                                    }}
                                >
                                    {fileParsing ? "Parsing..." : uploading ? "Uploading..." : "Upload spreadsheet"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        // reset input and message
                                        const input = document.getElementById("aiml-file-input") as HTMLInputElement;
                                        if (input) input.value = "";
                                        setMessage(null);
                                    }}
                                    className="px-3 py-2 border rounded-lg"
                                >
                                    Reset
                                </button>

                                <button
                                    type="button"
                                    onClick={fetchScrapedProducts}
                                    className="px-3 py-2 border rounded-lg ml-auto"
                                >
                                    Refresh products
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-3">
                            Note: the server receives <code>product_id</code> and <code>data</code> (JSON array). The backend should decide whether to append, merge or replace the product's data.
                        </p>
                    </div>


                    {/* 2) Choice + Start AIML */}
                    <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Select scraped product to run AI/ML</label>
                        {loadingScrapedProducts ? (
                            <div className="text-sm text-slate-500">Loading scraped products...</div>
                        ) : (
                            <select value={aimlChoice} onChange={(e) => setAimlChoice(e.target.value)} className="w-full p-2 border rounded-md mb-3">
                                {scrapedProducts.length === 0 && <option value="">No scraped data products</option>}
                                {scrapedProducts.map((p) => (
                                    <option key={p.product_id} value={p.product_id}>
                                        {p.product_name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <div className="flex items-center gap-3">
                            <button onClick={handleStartAIML} disabled={aimlRunning || !aimlChoice} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                                {aimlRunning ? "Starting..." : "Start AI/ML Engine"}
                            </button>
                            <button onClick={fetchScrapedProducts} className="px-3 py-2 border rounded-lg">Refresh scraped list</button>
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                            The AIML engine will be invoked with the selected product id. Your AIML API may pull stored historical entries for training/prediction from the DB.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
