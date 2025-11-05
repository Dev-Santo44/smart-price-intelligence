import React from 'react';


export default function QuickActions() {
    return (
        <div className="bg-white/80 dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-lg font-semibold">Quick Actions</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
                <button className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700">Upload CSV</button>
                <button className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700">Run Analysis</button>
                <button className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700">Generate Report</button>
                <button className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700">Configure Alerts</button>
            </div>
        </div>
    );
}