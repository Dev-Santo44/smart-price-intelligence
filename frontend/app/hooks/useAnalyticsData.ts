"use client";
import { useState, useEffect, useCallback, useRef } from "react";

interface UseAnalyticsDataOptions {
  section: string;
  params?: Record<string, string | number | undefined>;
  enabled?: boolean;
}

export function useAnalyticsData<T = any>({ section, params = {}, enabled = true }: UseAnalyticsDataOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      query.set("section", section);
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
      }
      const res = await fetch(`/api/analytics?${query.toString()}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to fetch data");
      }
    } finally {
      setIsLoading(false);
    }
  }, [section, JSON.stringify(params), enabled]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 150);
    return () => { clearTimeout(timer); abortRef.current?.abort(); };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
