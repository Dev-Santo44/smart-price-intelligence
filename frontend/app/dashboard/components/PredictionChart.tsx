import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    CartesianGrid,
} from 'recharts';

export default function PredictionChart({ data = [] }: { data?: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/80 dark:bg-slate-800 rounded-2xl p-6 shadow-sm h-64 flex items-center justify-center text-slate-500">
                No prediction data available for this product.
            </div>
        );
    }

    // Format dates for display
    const chartData = data.map(item => ({
        ...item,
        displayDate: new Date(item.ts).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        // Mock confidence bounds if needed, or use confidence directly
        upperBound: item.predicted_price * (1 + (1 - item.confidence) * 0.1),
        lowerBound: item.predicted_price * (1 - (1 - item.confidence) * 0.1),
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                    <p className="font-semibold text-sm mb-1">{label}</p>
                    <p className="text-sky-500 text-xs">
                        Predicted: ₹{payload[0].value.toLocaleString()}
                    </p>
                    {payload[0].payload.confidence && (
                        <p className="text-slate-500 text-[10px]">
                            Confidence: {(payload[0].payload.confidence * 100).toFixed(1)}%
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white/80 dark:bg-slate-800 rounded-2xl p-6 shadow-sm h-72">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Price Prediction</h3>
                    <p className="text-xs text-slate-500">AI-driven price forecasts for upcoming period</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span> Predicted Price
                    </span>
                </div>
            </div>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="displayDate"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10 }}
                            minTickGap={20}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="predicted_price"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
