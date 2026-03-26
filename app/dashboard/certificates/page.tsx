"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Navbar, PermissionGate } from "@/src/shared/ui";
import {
  useCertificates,
  revokeCertificate,
} from "@/src/modules/certificates/hooks";
import {
  CertificateTable,
  CertificateFilters,
  Pagination,
} from "@/src/modules/certificates/components";

export default function CertificatesPage() {
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debounced, setDebounced] = useState("");

  /* Debounce search */
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    const id = setTimeout(() => setDebounced(value), 400);
    return () => clearTimeout(id);
  }, []);

  const { data, loading, refetch } = useCertificates({
    status,
    search: debounced,
    page,
  });

  async function handleRevoke(id: string, serial: string) {
    if (!confirm(`¿Revocar el certificado ${serial}? Esta acción no se puede deshacer.`)) return;
    const json = await revokeCertificate(id);
    if (json.ok) refetch();
    else alert(json.message || "Error al revocar");
  }

  return (
    <>
      <Navbar title="Certificados" />

      <div className="pt-24 px-12 pb-12">
        {/* Hero */}
        <div className="flex justify-between items-end mb-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-on-surface font-headline tracking-tight mb-4">
              Gestión de Certificados
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Emite, revisa y gestiona los certificados académicos digitales. Cada certificado
              genera un código QR único de verificación y un hash criptográfico de integridad.
            </p>
          </div>
          <PermissionGate permission="certificates:create">
            <Link
              href="/dashboard/certificates/new"
              className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined">add</span>
              Nuevo Certificado
            </Link>
          </PermissionGate>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <CertificateFilters
            status={status}
            search={search}
            onStatusChange={(s) => {
              setStatus(s);
              setPage(1);
            }}
            onSearchChange={handleSearch}
          />
        </div>

        {/* Stats bar */}
        {data && (
          <div className="flex gap-6 mb-6 text-sm">
            <span className="text-on-surface-variant">
              <strong className="text-on-surface">{data.total}</strong> certificados encontrados
            </span>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined animate-spin text-primary text-[40px]">
              progress_activity
            </span>
            <p className="text-on-surface-variant mt-4">Cargando certificados...</p>
          </div>
        ) : (
          <>
            <CertificateTable
              certificates={data?.certificates ?? []}
              onRevoke={handleRevoke}
            />
            {data && (
              <Pagination
                page={data.page}
                pages={data.pages}
                total={data.total}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
