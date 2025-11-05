import { useQuery } from '@tanstack/react-query';
import axios from 'axios';


const fetchDashboard = async () => {
    // Replace this with your FastAPI /metrics and other endpoints when ready.
    const res = await axios.get('/api/dashboard');
    return res.data;
};


export function useDashboardData() {
    return useQuery(['dashboard'], fetchDashboard, {
        staleTime: 1000 * 60 * 2, // 2 minutes
        cacheTime: 1000 * 60 * 5,
    });
}