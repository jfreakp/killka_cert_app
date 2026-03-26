"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ───

export interface DashboardMetrics {
  totalStudents: number;
  totalIssued: number;
  totalPending: number;
  totalRevoked: number;
  issuedLast30: number;
  studentsLast30: number;
  chartData: ChartPoint[];
}

export interface ChartPoint {
  date: string;
  certificados: number;
}

export interface ActivityEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  result: string;
  actorName: string;
  actorRole: string | null;
  createdAt: string;
}

// ─── Generic fetch hook ───

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          setData(json.data);
        } else {
          setError(json.message ?? "Error al cargar datos");
        }
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ─── Hooks específicos ───

export function useDashboardMetrics() {
  return useFetch<DashboardMetrics>("/api/dashboard/metrics");
}

export function useDashboardActivity() {
  return useFetch<ActivityEntry[]>("/api/dashboard/activity");
}
