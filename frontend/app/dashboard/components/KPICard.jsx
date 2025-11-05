import React from 'react';


export default function KPICard({ title, value, delta }) {
    const isUp = delta >= 0;
    return (
        <div className="bg-white/80 dark:bg-slate-800 shadow-sm rounded-2xl p-4 flex flex-col">
            <div className="text-sm text-slate-500">{title}</div>
            <div className="mt-2 flex items-center gap-3">
                <div className="text-2xl font-semibold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                <div className={`text-sm font-medium ${isUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
                </div>
            </div>
            <div className="mt-2">
                {/* Sparkline can be added here if desired */}
            </div>
        </div>
    );
}