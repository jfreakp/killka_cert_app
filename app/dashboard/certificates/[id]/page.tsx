"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Navbar, PermissionGate } from "@/src/shared/ui";
import { useCertificate, revokeCertificate } from "@/src/modules/certificates/hooks";
import { QrDisplay, PdfUpload } from "@/src/modules/certificates/components";

const STATUS_MAP: Record<string, { label: string; className: string; icon: string }> = {
  DRAFT: {
    label: "Borrador",
    className: "bg-surface-container-low text-on-surface-variant",
    icon: "draft",
  },
  ISSUED: {
    label: "Emitido",
    className: "bg-primary-container text-on-primary-container",
    icon: "verified",
  },
  REVOKED: {
    label: "Revocado",
    className: "bg-error-container text-on-error-container",
    icon: "block",
  },
};

export default function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: cert, loading, error, refetch } = useCertificate(id);
  const [revoking, setRevoking] = useState(false);

  async function handleRevoke() {
    if (!cert) return;
    if (!confirm(`¿Revocar el certificado ${cert.serialNumber}? Esta acción no se puede deshacer.`))
      return;
    setRevoking(true);
    const json = await revokeCertificate(cert.id);
    if (json.ok) refetch();
    else alert(json.message || "Error al revocar");
    setRevoking(false);
  }

  if (loading) {
    return (
      <>
        <Navbar title="Certificado" />
        <div className="pt-24 px-12 pb-12 flex justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-[40px]">
            progress_activity
          </span>
        </div>
      </>
    );
  }

  if (error || !cert) {
    return (
      <>
        <Navbar title="Certificado" />
        <div className="pt-24 px-12 pb-12 text-center">
          <span className="material-symbols-outlined text-[64px] text-error mb-4 block">
            error
          </span>
          <p className="text-on-surface-variant text-lg">{error || "Certificado no encontrado"}</p>
          <Link
            href="/dashboard/certificates"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold"
          >
            Volver a certificados
          </Link>
        </div>
      </>
    );
  }

  const st = STATUS_MAP[cert.status] ?? STATUS_MAP.DRAFT;
  const degree = (cert.metadata as Record<string, unknown>)?.degree ?? cert.title;

  return (
    <>
      <Navbar title={cert.serialNumber} />

      <div className="pt-24 px-12 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <Link
              href="/dashboard/certificates"
              className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary mb-4 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Volver a certificados
            </Link>
            <h1 className="text-4xl font-black text-on-surface font-headline tracking-tight mb-2">
              {cert.title}
            </h1>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${st.className}`}
              >
                <span className="material-symbols-outlined text-[14px]">{st.icon}</span>
                {st.label}
              </span>
              <span className="font-mono text-sm text-on-surface-variant">
                {cert.serialNumber}
              </span>
              {cert.integrityValid ? (
                <span className="inline-flex items-center gap-1 text-xs text-primary font-bold">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  Integridad verificada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-error font-bold">
                  <span className="material-symbols-outlined text-[14px]">gpp_bad</span>
                  Integridad comprometida
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {cert.status === "ISSUED" && (
              <PermissionGate permission="certificates:revoke">
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="px-5 py-2.5 rounded-xl border-2 border-error text-error font-bold hover:bg-error-container/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">block</span>
                  {revoking ? "Revocando..." : "Revocar"}
                </button>
              </PermissionGate>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student card */}
            <div className="bg-surface-container-lowest rounded-2xl p-6">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                Datos del estudiante
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <InfoField
                  label="Nombre completo"
                  value={`${cert.student.firstName} ${cert.student.lastName}`}
                />
                <InfoField label="Código de estudiante" value={cert.student.studentCode} />
                <InfoField label="Carrera" value={cert.student.career} />
                <InfoField label="Email" value={cert.student.email || "—"} />
              </div>
            </div>

            {/* Certificate info */}
            <div className="bg-surface-container-lowest rounded-2xl p-6">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                Datos del certificado
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="Título" value={cert.title} />
                <InfoField label="Grado / Carrera" value={String(degree)} />
                <InfoField label="Universidad" value={cert.tenant.name} />
                <InfoField
                  label="Fecha de emisión"
                  value={
                    cert.issuedAt
                      ? new Date(cert.issuedAt).toLocaleDateString("es-EC", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"
                  }
                />
                {cert.revokedAt && (
                  <InfoField
                    label="Fecha de revocación"
                    value={new Date(cert.revokedAt).toLocaleDateString("es-EC", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                )}
              </div>
            </div>

            {/* Hash & integrity */}
            <div className="bg-surface-container-lowest rounded-2xl p-6">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                Seguridad e integridad
              </h3>
              <div className="space-y-4">
                <InfoField label="Código público" value={cert.publicCode} mono />
                <InfoField label="Hash SHA-256" value={cert.qrPayloadHash || "—"} mono />
                <InfoField
                  label="URL de verificación"
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify/${cert.publicCode}`}
                  mono
                />
              </div>
            </div>

            {/* PDF upload */}
            <PermissionGate permission="certificates:create">
              <PdfUpload
                certificateId={cert.id}
                currentPdfUrl={cert.pdfUrl}
                onUploaded={refetch}
              />
            </PermissionGate>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QrDisplay certificateId={cert.id} serialNumber={cert.serialNumber} />

            {/* Quick actions */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Acciones
              </h3>
              <Link
                href={`/verify/${cert.publicCode}`}
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">
                  qr_code_2
                </span>
                <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Abrir verificación pública
                </span>
              </Link>
              {cert.pdfUrl && (
                <a
                  href={cert.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    download
                  </span>
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    Descargar PDF
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-on-surface ${mono ? "font-mono text-xs break-all" : "text-sm font-medium"}`}
      >
        {value}
      </p>
    </div>
  );
}
