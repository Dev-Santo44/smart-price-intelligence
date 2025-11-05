import React from 'react';


export default function RecommendationList({ items = [], onAccept, onReject }) {
    return (
        <div className="bg-white/80 dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Recommendations</div>
                <div className="text-sm text-slate-500">Top priority</div>
            </div>
            <div className="mt-3 space-y-3">
                {items.map(r => (
                    <div key={r.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <div className="font-medium">{r.product}</div>
                            <div className="text-sm text-slate-500">Impact: {r.impact} • Confidence: {(r.confidence * 100).toFixed(0)}%</div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className={`px-2 py-1 rounded-md text-xs ${r.priority === 'High' ? 'bg-rose-100 text-rose-700' : r.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{r.priority}</div>
                            <div className="flex gap-2">
                                <button onClick={() => onAccept?.(r)} className="text-sm px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">Accept</button>
                                <button onClick={() => onReject?.(r)} className="text-sm px-2 py-1 rounded border">Reject</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}