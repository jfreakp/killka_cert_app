"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface VerificationResult {
  valid: boolean;
  status: string;
  integrityValid?: boolean;
  studentName?: string;
  studentCode?: string;
  university?: string;
  title?: string;
  degree?: string;
  issuedAt?: string;
  revokedAt?: string;
  serialNumber?: string;
  pdfUrl?: string;
  message?: string;
}

export default function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/verification/${code}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json.data);
        else setData({ valid: false, status: "ERROR", message: "Error al verificar" });
      })
      .catch(() => setData({ valid: false, status: "ERROR", message: "Error de conexión" }))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center px-4 py-12">
      {/* Brand */}
      <Link href="/" className="mb-8">
        <h1 className="text-2xl font-black font-headline text-primary tracking-tight">
          Rikuchik
        </h1>
        <p className="text-xs text-on-surface-variant text-center">Verificación de certificados</p>
      </Link>

      {loading ? (
        <div className="bg-surface-container-lowest rounded-3xl shadow-lg p-12 text-center max-w-lg w-full">
          <span className="material-symbols-outlined animate-spin text-primary text-[48px] block mb-4">
            progress_activity
          </span>
          <p className="text-on-surface-variant">Verificando certificado...</p>
        </div>
      ) : !data || data.status === "NOT_FOUND" ? (
        <div className="bg-surface-container-lowest rounded-3xl shadow-lg p-12 text-center max-w-lg w-full">
          <span className="material-symbols-outlined text-[64px] text-error block mb-4">
            cancel
          </span>
          <h2 className="text-2xl font-black font-headline text-on-surface mb-2">
            Certificado no encontrado
          </h2>
          <p className="text-on-surface-variant">
            El código de verificación no corresponde a ningún certificado registrado.
          </p>
        </div>
      ) : data.status === "REVOKED" ? (
        <div className="bg-surface-container-lowest rounded-3xl shadow-lg p-12 text-center max-w-lg w-full">
          <span className="material-symbols-outlined text-[64px] text-error block mb-4">
            block
          </span>
          <h2 className="text-2xl font-black font-headline text-error mb-2">
            Certificado Revocado
          </h2>
          <p className="text-on-surface-variant mb-6">
            Este certificado fue emitido pero posteriormente ha sido revocado por la institución.
          </p>

          <div className="text-left bg-surface-container-low rounded-2xl p-6 space-y-3">
            <InfoRow label="Estudiante" value={data.studentName} />
            <InfoRow label="Título" value={data.title} />
            <InfoRow label="Universidad" value={data.university} />
            <InfoRow label="Serial" value={data.serialNumber} />
            {data.revokedAt && (
              <InfoRow
                label="Revocado el"
                value={new Date(data.revokedAt).toLocaleDateString("es-EC", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl shadow-lg max-w-lg w-full overflow-hidden">
          {/* Status banner */}
          <div
            className={`py-6 px-8 text-center ${
              data.valid
                ? "bg-primary-container"
                : "bg-error-container"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[56px] block mb-2 ${
                data.valid ? "text-on-primary-container" : "text-on-error-container"
              }`}
            >
              {data.valid ? "verified" : "gpp_bad"}
            </span>
            <h2
              className={`text-2xl font-black font-headline ${
                data.valid ? "text-on-primary-container" : "text-on-error-container"
              }`}
            >
              {data.valid ? "Certificado Válido" : "Integridad comprometida"}
            </h2>
            {data.integrityValid === false && (
              <p className="text-sm text-on-error-container mt-1">
                El hash del certificado no coincide. El documento puede haber sido alterado.
              </p>
            )}
          </div>

          {/* Details */}
          <div className="p-8 space-y-4">
            <InfoRow label="Estudiante" value={data.studentName} />
            {data.studentCode && <InfoRow label="Código" value={data.studentCode} />}
            <InfoRow label="Título" value={data.title} />
            {data.degree && data.degree !== data.title && (
              <InfoRow label="Carrera" value={data.degree} />
            )}
            <InfoRow label="Universidad" value={data.university} />
            <InfoRow label="Nro. Serial" value={data.serialNumber} />
            {data.issuedAt && (
              <InfoRow
                label="Fecha de emisión"
                value={new Date(data.issuedAt).toLocaleDateString("es-EC", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
            )}

            {data.pdfUrl && (
              <a
                href={data.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-dim transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Descargar Certificado PDF
              </a>
            )}
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-on-surface-variant text-center max-w-sm">
        Este sistema de verificación es operado por Rikuchik. La autenticidad del certificado se
        valida mediante un hash criptográfico SHA-256.
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-outline-variant/10 last:border-0">
      <span className="text-sm text-on-surface-variant shrink-0">{label}</span>
      <span className="text-sm font-semibold text-on-surface text-right">{value}</span>
    </div>
  );
}
