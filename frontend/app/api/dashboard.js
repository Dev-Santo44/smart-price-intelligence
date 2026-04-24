import { NextApiRequest, NextApiResponse } from 'next';

const KPIS = [
    { id: 'products',        title: 'Products Monitored',       value: 5,    delta:  3.4 },
    { id: 'competitors',     title: 'Active Competitors',       value: 5,    delta: -1.2 },
    { id: 'recommendations', title: 'Pending Recommendations',  value: 5,    delta:  5.1 },
    { id: 'opportunities',   title: 'Pricing Opportunities',    value: 3,    delta: 12.3 },
];

const PRICE_SERIES = [
    { date: '2026-01-01', your: 2300, competitor: 2420 },
    { date: '2026-01-15', your: 2320, competitor: 2400 },
    { date: '2026-02-01', your: 2350, competitor: 2380 },
    { date: '2026-02-15', your: 2370, competitor: 2410 },
    { date: '2026-03-01', your: 2380, competitor: 2450 },
    { date: '2026-03-15', your: 2390, competitor: 2460 },
    { date: '2026-04-01', your: 2400, competitor: 2570 },
];

// Real product price change feed
const RECENT_PRICE_CHANGES = [
    { product_id: 'P-1001', name: 'Enterprise CRM License', your_price: 2400, competitor: 'TechVault',  competitor_price: 2568, change_pct: 11.1, timestamp: '2026-04-24T08:00:00Z' },
    { product_id: 'P-1002', name: 'Cloud Storage Pro',       your_price: 1068, competitor: 'CloudNine',  competitor_price:  998, change_pct: -7.3, timestamp: '2026-04-24T06:00:00Z' },
    { product_id: 'P-1003', name: 'API Gateway Plus',        your_price: 3588, competitor: 'DataPrime',  competitor_price: 3320, change_pct: -7.4, timestamp: '2026-04-23T18:00:00Z' },
];

const RECOMMENDATIONS = [
    { id: 'R-2001', product: 'Enterprise CRM License', impact: '+7.5% margin', priority: 'High',   confidence: 0.92 },
    { id: 'R-2002', product: 'Cloud Storage Pro',       impact: '-6.6% price',  priority: 'High',   confidence: 0.78 },
    { id: 'R-2003', product: 'Security Shield Pro',     impact: '-7.9% price',  priority: 'Medium', confidence: 0.71 },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ kpis: KPIS, priceSeries: PRICE_SERIES, recent: RECENT_PRICE_CHANGES, recommendations: RECOMMENDATIONS });
}