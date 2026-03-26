"use client";

import { useEffect, useState, useCallback } from "react";

/* ── Types ── */

export interface CertificateRow {
  id: string;
  serialNumber: string;
  publicCode: string;
  title: string;
  status: "DRAFT" | "ISSUED" | "REVOKED";
  issuedAt: string | null;
  revokedAt: string | null;
  pdfUrl: string | null;
  qrPayloadHash: string | null;
  metadata: Record<string, unknown> | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    studentCode: string;
    email: string | null;
    career: string;
  };
  tenant: {
    id: string;
    name: string;
  };
}

export interface CertificateDetail extends CertificateRow {
  integrityValid: boolean;
}

export interface CertificateListResponse {
  certificates: CertificateRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  career: string;
}

/* ── Generic fetch ── */

function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json.data);
        else setError(json.message ?? "Error al cargar datos");
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/* ── Hooks ── */

export function useCertificates(params: {
  status?: string;
  search?: string;
  page?: number;
}) {
  const sp = new URLSearchParams();
  if (params.status && params.status !== "ALL") sp.set("status", params.status);
  if (params.search) sp.set("search", params.search);
  if (params.page && params.page > 1) sp.set("page", String(params.page));

  const url = `/api/certificates?${sp.toString()}`;
  return useFetch<CertificateListResponse>(url);
}

export function useCertificate(id: string | null) {
  return useFetch<CertificateDetail>(id ? `/api/certificates/${id}` : null);
}

export function useStudentOptions() {
  return useFetch<StudentOption[]>("/api/students");
}

/* ── Mutations ── */

export async function createCertificate(data: {
  studentId: string;
  title: string;
  degree: string;
  issueDate?: string;
}) {
  const res = await fetch("/api/certificates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function revokeCertificate(id: string) {
  const res = await fetch(`/api/certificates/${id}/revoke`, { method: "POST" });
  return res.json();
}

export async function uploadPdf(id: string, file: File) {
  const form = new FormData();
  form.append("pdf", file);
  const res = await fetch(`/api/certificates/${id}/pdf`, { method: "POST", body: form });
  return res.json();
}
