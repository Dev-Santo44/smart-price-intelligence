import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';


export default function Sparkline({ data = [] }) {
    const tiny = data.map((d, i) => ({ x: i, y: d }));
    return (
        <div className="h-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tiny} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="y" strokeWidth={1} stroke="#60a5fa" fillOpacity={0.12} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}