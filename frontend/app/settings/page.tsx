"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';

interface Product {
    id: string;
    product_id: string;
    name: string;
    your_price: number | string;
    timestamp: string;
    domain: string | null;
}

interface ProductForm {
    product_id: string;
    name: string;
    your_price: string | number;
    timestamp: string;
    domain: string;
}

interface Message {
    id: number;
    text: string;
    type: 'success' | 'error' | 'info';
}

export default function SettingsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [form, setForm] = useState<ProductForm>({ product_id: '', name: '', your_price: '', timestamp: '', domain: '' });
    const [editing, setEditing] = useState<Product | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isAdmin, setIsAdmin] = useState(true);
    const [globalElasticity, setGlobalElasticity] = useState(1.2);
    const [globalProfitMargin, setGlobalProfitMargin] = useState(20);

    const addMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now();
        setMessages(prev => [...prev, { id, text, type }]);
        setTimeout(() => setMessages(prev => prev.filter(m => m.id !== id)), 5000);
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    function validateRow(row: ProductForm | Product | any): boolean {
        if (!row.product_id || !row.name || row.your_price === undefined || row.your_price === "" || !row.timestamp) return false;
        if (isNaN(Number(row.your_price))) return false;
        return true;
    }

    async function handleAddManual(e: FormEvent) {
        e.preventDefault(); // important — stops default form submit that creates a GET/POST to current page
        // validation
        if (!validateRow(form)) {
            addMessage("Please provide Product ID, Name, your_price (number) and timestamp.", "error");
            return;
        }

        const payload = {
            product_id: String(form.product_id).trim(),
            name: String(form.name).trim(),
            your_price: Number(form.your_price),
            timestamp: String(form.timestamp).trim(),
            domain: form.domain ? String(form.domain).trim() : null,
        };

        console.log("Sending POST /api/products payload:", payload); // <-- check browser console

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            console.log('POST /api/products response:', json); // <-- check browser console

            if (!res.ok) {
                addMessage(`Server error: ${json?.error || res.statusText}`, 'error');
                return;
            }

            // If API returns inserted rows (array or object)
            const inserted = json.inserted ?? json; // adapt depending on your server response shape
            if (Array.isArray(inserted)) {
                setProducts(p => [...inserted, ...p]);
            } else {
                setProducts(p => [inserted, ...p]);
            }
            setForm({ product_id: '', name: '', your_price: '', timestamp: '', domain: '' });
            addMessage('Product added.', 'success');
        } catch (err) {
            console.error('Add product error:', err);
            addMessage('Failed to add product (network/error). See console.', 'error');
        }
    }

    function handleCSVUpload(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const text = ev.target?.result as string;
            if (!text) return;
            const lines = text.split(/\r?\n/).filter(Boolean);
            if (!lines.length) { addMessage('CSV is empty', 'error'); return; }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const idx: { [key: string]: number } = {};
            headers.forEach((h, i) => idx[h] = i);

            // required header names (lowercase)
            const required = ['product id', 'name', 'your_price', 'timestamp'];
            const missing = required.filter(r => !headers.includes(r) && !headers.includes(r.replace(' ', '_')));
            if (missing.length) {
                addMessage(`CSV headers missing: ${missing.join(', ')}`, 'error');
                return;
            }

            const rows = lines.slice(1).map(line => {
                const cols = line.split(',').map(c => c.trim());
                return {
                    product_id: cols[idx['product id']] ?? cols[idx['product_id']] ?? '',
                    name: cols[idx['name']] ?? '',
                    your_price: cols[idx['your_price']] ?? cols[idx['your price']] ?? '',
                    timestamp: cols[idx['timestamp']] ?? '',
                    domain: form.domain || null, // optional default domain from UI
                };
            });

            const good: any[] = [], badLines: number[] = [];
            rows.forEach((r, i) => {
                if (validateRow(r)) good.push({
                    product_id: String(r.product_id).trim(),
                    name: String(r.name).trim(),
                    your_price: Number(r.your_price),
                    timestamp: String(r.timestamp).trim(),
                    domain: r.domain || null
                });
                else badLines.push(i + 2);
            });

            if (!good.length) {
                addMessage('No valid rows to import.', 'error');
                return;
            }

            console.log('Bulk import payload:', good); // <-- check browser console

            // send bulk as a single POST (server route supports array)
            try {
                const res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(good),
                });
                const json = await res.json();
                console.log('Bulk import response:', json);

                if (!res.ok) {
                    addMessage(`Import failed: ${json?.error || res.statusText}`, 'error');
                    return;
                }

                const inserted = json.inserted ?? json;
                if (Array.isArray(inserted)) setProducts(p => [...inserted, ...p]);
                addMessage(`${good.length} product(s) imported.`, 'success');
                if (badLines.length) addMessage(`Invalid rows at lines: ${badLines.join(', ')}`, 'error');
            } catch (err) {
                console.error('CSV import error:', err);
                addMessage('Failed to import CSV (network/error). See console.', 'error');
            }
        };

        reader.readAsText(file);
        e.target.value = '';
    }

    async function handleDelete(id: string) {
        if (!isAdmin) { addMessage('Only admin can delete.', 'error'); return; }
        if (!confirm('Delete this product?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('delete failed');
            setProducts(p => p.filter(x => x.id !== id));
            addMessage('Product deleted', 'success');
        } catch (err) { addMessage('Failed to delete (API).', 'error'); console.error(err); }
    }

    function startEdit(prod: Product) { setEditing({ ...prod }); }

    function handleEditChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setEditing(s => (s ? { ...s, [name]: value } : null));
    }

    async function saveEdit(e: FormEvent) {
        e.preventDefault();
        if (!editing) return;
        if (!validateRow(editing)) { addMessage('Edited product missing required fields', 'error'); return; }
        try {
            const res = await fetch(`/api/products/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
            if (!res.ok) throw new Error('update failed');
            const updated = await res.json();
            setProducts(p => p.map(it => it.id === updated.id ? updated : it));
            setEditing(null);
            addMessage('Product updated', 'success');
        } catch (err) {
            addMessage('Failed to update (API).', 'error');
            console.error(err);
        }
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
                                <input name="domain" value={editing.domain || ''} onChange={handleEditChange} className="border p-2 rounded w-full" />
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