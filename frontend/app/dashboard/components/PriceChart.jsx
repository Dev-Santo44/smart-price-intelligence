import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';


export default function PriceChart({ series = [] }) {
    return (
        <div className="bg-white/80 dark:bg-slate-800 rounded-2xl p-4 shadow-sm h-64">
            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Price Competitiveness</div>
                <div className="text-sm text-slate-500">Last 30 days</div>
            </div>
            <div className="mt-3 h-44">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series}>
                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="your" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="competitor" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}