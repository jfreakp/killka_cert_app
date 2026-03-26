"use client";

import Link from "next/link";
import { PermissionGate } from "@/src/shared/ui";
import type { CertificateRow } from "../hooks";

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

interface Props {
  certificates: CertificateRow[];
  onRevoke?: (id: string, serial: string) => void;
}

export function CertificateTable({ certificates, onRevoke }: Props) {
  if (certificates.length === 0) {
    return (
      <div className="py-20 text-center">
        <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4 block">
          description
        </span>
        <p className="text-on-surface-variant text-lg">No se encontraron certificados.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="text-left px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">
                Serial
              </th>
              <th className="text-left px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">
                Estudiante
              </th>
              <th className="text-left px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">
                Título
              </th>
              <th className="text-left px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">
                Fecha
              </th>
              <th className="text-center px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">
                Estado
              </th>
              <th className="text-right px-6 py-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert) => {
              const st = STATUS_MAP[cert.status] ?? STATUS_MAP.DRAFT;
              return (
                <tr
                  key={cert.id}
                  className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                    {cert.serialNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-on-surface">
                      {cert.student.firstName} {cert.student.lastName}
                    </div>
                    <div className="text-xs text-on-surface-variant">{cert.student.studentCode}</div>
                  </td>
                  <td className="px-6 py-4 text-on-surface max-w-[200px] truncate">
                    {cert.title}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {cert.issuedAt
                      ? new Date(cert.issuedAt).toLocaleDateString("es-EC", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${st.className}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{st.icon}</span>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      {/* View */}
                      <Link
                        href={`/dashboard/certificates/${cert.id}`}
                        className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                        title="Ver detalle"
                      >
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                          visibility
                        </span>
                      </Link>

                      {/* Download PDF */}
                      {cert.pdfUrl && (
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                          title="Descargar PDF"
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                            download
                          </span>
                        </a>
                      )}

                      {/* Verify */}
                      <PermissionGate permission="certificates:verify">
                        <Link
                          href={`/verify/${cert.publicCode}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-primary-container/40 transition-colors"
                          title="Verificar"
                        >
                          <span className="material-symbols-outlined text-[18px] text-primary">
                            qr_code_2
                          </span>
                        </Link>
                      </PermissionGate>

                      {/* Revoke */}
                      {cert.status === "ISSUED" && onRevoke && (
                        <PermissionGate permission="certificates:revoke">
                          <button
                            onClick={() => onRevoke(cert.id, cert.serialNumber)}
                            className="p-2 rounded-lg hover:bg-error-container/20 transition-colors"
                            title="Revocar"
                          >
                            <span className="material-symbols-outlined text-[18px] text-error">
                              block
                            </span>
                          </button>
                        </PermissionGate>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
