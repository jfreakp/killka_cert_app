"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/src/shared/ui";

interface CertificateRow {
  id: string;
  serialNumber: string;
  status: string;
  issuedAt: string | null;
  student: { firstName: string; lastName: string; studentCode: string };
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Borrador",
    className: "bg-surface-container-low text-on-surface-variant",
  },
  ISSUED: {
    label: "Emitido",
    className: "bg-primary-container text-on-primary-container",
  },
  REVOKED: {
    label: "Revocado",
    className: "bg-error-container text-on-error-container",
  },
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setCertificates(json.data);
      })
      .catch(() => {});
  }, []);

  const filtered =
    filter === "ALL" ? certificates : certificates.filter((c) => c.status === filter);

  return (
    <>
      <Navbar title="Certificados">
        <div className="flex gap-2">
          {["ALL", "DRAFT", "ISSUED", "REVOKED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                filter === f
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {f === "ALL" ? "Todos" : STATUS_MAP[f]?.label ?? f}
            </button>
          ))}
        </div>
      </Navbar>

      <div className="pt-24 px-12 pb-12">
        {/* Hero */}
        <div className="flex justify-between items-end mb-12">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-on-surface font-headline tracking-tight mb-4">
              Gestión de Certificados
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Emite, revisa y gestiona los certificados académicos digitales. Cada certificado
              genera un código único de verificación en la red Polygon.
            </p>
          </div>
          <Link
            href="/dashboard/certificates/new"
            className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <span className="material-symbols-outlined">add</span>
            Nuevo Certificado
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center text-on-surface-variant">
              No se encontraron certificados.
            </div>
          ) : (
            filtered.map((cert) => {
              const st = STATUS_MAP[cert.status] ?? STATUS_MAP.DRAFT;
              return (
                <div
                  key={cert.id}
                  className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.className}`}>
                      {st.label}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-surface-container-low transition-all">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        more_vert
                      </span>
                    </button>
                  </div>

                  <h3 className="font-bold text-lg mb-1">
                    {cert.student.firstName} {cert.student.lastName}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-4 font-mono">
                    {cert.serialNumber}
                  </p>

                  <div className="flex justify-between items-center text-xs text-on-surface-variant">
                    <span>{cert.student.studentCode}</span>
                    {cert.issuedAt && (
                      <span>{new Date(cert.issuedAt).toLocaleDateString("es-EC")}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
