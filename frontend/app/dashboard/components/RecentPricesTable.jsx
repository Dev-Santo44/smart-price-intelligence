// components/RecentPricesTable.jsx
import React from "react";

export default function RecentPricesTable({ rows = [], onView }) {
  return (
    <div className="bg-white/80 dark:bg-slate-800 rounded-2xl p-4 shadow-sm overflow-auto">
      <div className="text-lg font-semibold mb-3">Recent Price Changes</div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="pb-2">Product</th>
            <th className="pb-2">Your Price</th>
            <th className="pb-2">Competitor</th>
            <th className="pb-2">Comp. Price</th>
            <th className="pb-2">Change %</th>
            <th className="pb-2">When</th>
            <th className="pb-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.product_id} className="border-t border-slate-100 dark:border-slate-700">
              <td className="py-3"> <div className="font-medium">{r.name}</div> <div className="text-xs text-slate-500">{r.product_id}</div></td>
              <td className="py-3">${r.your_price.toFixed(2)}</td>
              <td className="py-3">{r.competitor}</td>
              <td className="py-3">${r.competitor_price.toFixed(2)}</td>
              <td className={`py-3 font-medium ${r.change_pct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{r.change_pct >=0 ? '▲' : '▼'} {Math.abs(r.change_pct).toFixed(1)}%</td>
              <td className="py-3 text-xs text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
              <td className="py-3"><button onClick={() => onView?.(r)} className="px-3 py-1 rounded bg-sky-600 text-white text-sm">View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
