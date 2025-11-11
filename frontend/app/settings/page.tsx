// File: app/(dashboard)/settings/page.jsx
// Next.js App Router page (client component)
"use client";


import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function SettingsPage() {
    const router = useRouter();
    const [isAdmin] = useState(true);
    const [globalElasticity, setGlobalElasticity] = useState(1.2);
    const [globalProfitMargin, setGlobalProfitMargin] = useState(20);
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ product_id: "", name: "", your_price: "", timestamp: "", domain: "" });
    const [editing, setEditing] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // TODO: Replace with real fetch from /api/products
        // For now fetch dummy list from API stub
        fetch('/api/products')
            .then(r => r.json())
            .then(data => setProducts(data || []))
            .catch(() => setProducts([]));
    }, []);


    function addMessage(text, type = "info") {
        setMessages((m) => [...m, { id: Date.now(), text, type }]);
    }


    function handleFormChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }


    function validateRow(row) {
        if (!row.product_id || !row.name || row.your_price === undefined || row.your_price === "" || !row.timestamp) return false;
        if (isNaN(Number(row.your_price))) return false;
        return true;
    } async function handleAddManual(e) {


        const payload = { ...form, your_price: Number(form.your_price) };
        try {
            const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error('Failed');
            const newProd = await res.json();
            setProducts((p) => [newProd, ...p]);
            setForm({ product_id: "", name: "", your_price: "", timestamp: "", domain: "" });
            addMessage('Product added.', 'success');
        } catch (err) {
            addMessage('Failed to add product (API). See console.', 'error');
            console.error(err);
        }
    }


    function handleCSVUpload(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const text = ev.target.result;
            const lines = text.split(/\r?\n/).filter(Boolean);
            if (!lines.length) { addMessage('CSV is empty', 'error'); return; }
            const headers = lines[0].split(',').map(h => h.trim());
            const expected = ['product id', 'name', 'your_price', 'timestamp'];
            const found = headers.map(h => h.toLowerCase());
            const missing = expected.filter(r => !found.includes(r));
            if (missing.length) { addMessage('CSV must contain headers: Product ID, Name, your_price, timestamp', 'error'); return; }


            const idx = {}; headers.forEach((h, i) => idx[h.toLowerCase()] = i);
            const rows = lines.slice(1).map(line => {
                const cols = line.split(',').map(c => c.trim());
                return {
                    product_id: cols[idx['product id']] || '',
                    name: cols[idx['name']] || '',
                    your_price: cols[idx['your_price']] || '',
                    timestamp: cols[idx['timestamp']] || ''
                };
            });
            const good = [];
            const bad = [];
            for (let i = 0; i < rows.length; i++) {
                if (validateRow(rows[i])) good.push(rows[i]); else bad.push(i + 2);
            }


            if (good.length) {
                // send bulk create to API (stub supports single creates for demo)
                for (const r of good) {
                    try {
                        const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...r, your_price: Number(r.your_price) }) });
                        if (res.ok) {
                            const np = await res.json();
                            setProducts(p => [np, ...p]);
                        }
                    } catch (err) { console.error(err); }
                }
                addMessage(`${good.length} product(s) imported.`, 'success');
            }
            if (bad.length) addMessage(`Invalid rows at lines: ${bad.join(', ')}`, 'error');
        };
        reader.readAsText(file);
        e.target.value = null;
    }


    async function handleDelete(id) {
        if (!isAdmin) { addMessage('Only admin can delete.', 'error'); return; }
        if (!confirm('Delete this product?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('delete failed');
            setProducts(p => p.filter(x => x.id !== id));
            addMessage('Product deleted', 'success');
        } catch (err) { addMessage('Failed to delete (API).', 'error'); console.error(err); }
    }
    function startEdit(prod) { setEditing({ ...prod }); }


    function handleEditChange(e) { const { name, value } = e.target; setEditing(s => ({ ...s, [name]: value })); }


    async function saveEdit(e) {
        e.preventDefault();
        if (!validateRow(editing)) { addMessage('Edited product missing required fields', 'error'); return; }
        try {
            const res = await fetch(`/api/products/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
            if (!res.ok) throw new Error('update failed');
            const updated = await res.json();
            setProducts(p => p.map(it => it.id === updated.id ? updated : it));
            setEditing(null);
            addMessage('Product updated', 'success');
        } catch (err) { addMessage('Failed to update (API).', 'error'); console.error(err); }
    }
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold">Settings — Product Catalog</h1>
                <p className="text-sm text-gray-600 mt-1">Add / import products, set global pricing parameters, and manage entries.</p>
            </header>


            <section className="bg-white shadow rounded p-4 mb-6">
                <h2 className="text-lg font-medium mb-3">Global Pricing Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price Elasticity (global)</label>
                        <input type="number" step="0.01" value={globalElasticity} onChange={(e) => setGlobalElasticity(Number(e.target.value))} className="mt-1 block w-full border rounded p-2" />
                        <p className="text-xs text-gray-500 mt-1">This value will be used as default when computing elasticity for products without a specific estimate.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Profit Margin % (global)</label>
                        <input type="number" step="0.1" value={globalProfitMargin} onChange={(e) => setGlobalProfitMargin(Number(e.target.value))} className="mt-1 block w-full border rounded p-2" />
                        <p className="text-xs text-gray-500 mt-1">Applied as default margin for new products (can be overridden per-product later).</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Global Settings</button>
                        <button className="px-4 py-2 border rounded" onClick={() => { setGlobalElasticity(1.2); setGlobalProfitMargin(20); addMessage('Reset global settings to defaults', 'info') }}>Reset</button>
                    </div>
                </div>
            </section>
            <section className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white shadow rounded p-4">
                    <h3 className="font-medium mb-3">Add Product (manual)</h3>
                    <form onSubmit={handleAddManual} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input name="product_id" value={form.product_id} onChange={handleFormChange} placeholder="Product ID (e.g. P-1234)" className="border p-2 rounded" />
                            <input name="name" value={form.name} onChange={handleFormChange} placeholder="Name" className="border p-2 rounded" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input name="your_price" value={form.your_price} onChange={handleFormChange} placeholder="your_price (number)" className="border p-2 rounded" />
                            <input name="timestamp" value={form.timestamp} onChange={handleFormChange} placeholder="timestamp (ISO)" className="border p-2 rounded" />
                        </div>
                        <div>
                            <input name="domain" value={form.domain} onChange={handleFormChange} placeholder="domain (company domain)" className="border p-2 rounded w-full" />
                            <p className="text-xs text-gray-500 mt-1">We will store this along with product data in the DB (example: example.com)</p>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add Product</button>
                            <button type="button" className="px-4 py-2 border rounded" onClick={() => setForm({ product_id: "", name: "", your_price: "", timestamp: "", domain: "" })}>Clear</button>
                        </div>
                    </form>
                </div>
                <div className="bg-white shadow rounded p-4">
                    <h3 className="font-medium mb-3">Import Products (CSV)</h3>
                    <p className="text-sm text-gray-600 mb-3">CSV must contain these headers: <strong>Product ID, Name, your_price, timestamp</strong> (columns can be in any order).</p>
                    <input type="file" accept=".csv,text/csv" onChange={handleCSVUpload} />
                    <div className="mt-4 text-xs text-gray-500">
                        <p>Example CSV row:</p>
                        <code className="block p-2 bg-gray-100 rounded">Product ID,Name,your_price,timestamp
                            P-2001,Example Product,12.5,2025-10-21T11:00:00Z</code>
                    </div>
                </div>
            </section>


            <div className="space-y-2 mb-6">
                {messages.map((m) => (
                    <div key={m.id} className={`p-2 rounded ${m.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : m.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
                        {m.text}
                    </div>
                ))}
            </div>


            <section className="bg-white shadow rounded p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Added Products</h3>
                    <div className="text-sm text-gray-600">Showing {products.length} product(s)</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="text-left text-sm text-gray-600">
                                <th className="p-2">Product ID</th>
                                <th className="p-2">Name</th>
                                <th className="p-2">Your Price</th>
                                <th className="p-2">Timestamp</th>
                                <th className="p-2">Domain</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id} className="border-t">
                                    <td className="p-2 align-top">{p.product_id}</td>
                                    <td className="p-2 align-top">{p.name}</td>
                                    <td className="p-2 align-top">{p.your_price}</td>
                                    <td className="p-2 align-top">{p.timestamp}</td>
                                    <td className="p-2 align-top">{p.domain || '—'}</td>
                                    <td className="p-2 align-top">
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 border rounded text-sm" onClick={() => startEdit(p)}>Edit</button>
                                            {isAdmin ? (
                                                <button className="px-3 py-1 border rounded text-sm text-red-600" onClick={() => handleDelete(p.id)}>Delete</button>
                                            ) : (
                                                <button className="px-3 py-1 border rounded text-sm text-gray-400" disabled>Delete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            {editing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded shadow-lg max-w-xl w-full p-4">
                        <h4 className="font-medium mb-2">Edit Product</h4>
                        <form onSubmit={saveEdit} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input name="product_id" value={editing.product_id} onChange={handleEditChange} className="border p-2 rounded" />
                                <input name="name" value={editing.name} onChange={handleEditChange} className="border p-2 rounded" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input name="your_price" value={editing.your_price} onChange={handleEditChange} className="border p-2 rounded" />
                                <input name="timestamp" value={editing.timestamp} onChange={handleEditChange} className="border p-2 rounded" />
                            </div>
                            <div>
                                <input name="domain" value={editing.domain} onChange={handleEditChange} className="border p-2 rounded w-full" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" className="px-4 py-2 border rounded" onClick={() => setEditing(null)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
}