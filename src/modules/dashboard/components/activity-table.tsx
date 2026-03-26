"use client";

import { ROLE_LABELS, type Role } from "@/src/shared/auth/permissions";
import type { ActivityEntry } from "../hooks";

const ACTION_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  CREATE_STUDENT: { icon: "person_add", label: "Estudiante registrado", color: "text-primary" },
  ISSUE_CERTIFICATE: { icon: "verified", label: "Certificado emitido", color: "text-tertiary" },
  REVOKE_CERTIFICATE: { icon: "block", label: "Certificado revocado", color: "text-error" },
  UPDATE_STUDENT: { icon: "edit", label: "Estudiante actualizado", color: "text-secondary" },
  DELETE_STUDENT: { icon: "delete", label: "Estudiante eliminado", color: "text-error" },
  CREATE_USER: { icon: "group_add", label: "Usuario creado", color: "text-primary" },
};

const DEFAULT_ACTION = { icon: "info", label: "Acción", color: "text-on-surface-variant" };

interface ActivityTableProps {
  entries: ActivityEntry[];
  loading: boolean;
}

export default function ActivityTable({ entries, loading }: ActivityTableProps) {
  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-12 shadow-sm flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-12 shadow-sm text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-3">history</span>
        <p className="text-on-surface-variant font-medium">No hay actividad reciente.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-container-low flex items-center justify-between">
        <h3 className="font-bold text-lg text-on-surface">Actividad Reciente</h3>
        <a
          href="/dashboard/audit"
          className="text-sm font-semibold text-primary hover:text-primary-dim transition-colors flex items-center gap-1"
        >
          Ver todo
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-container-low/50">
            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Acción</th>
            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Entidad</th>
            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Usuario</th>
            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Resultado</th>
            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-low">
          {entries.map((entry) => {
            const cfg = ACTION_CONFIG[entry.action] ?? {
              ...DEFAULT_ACTION,
              label: entry.action.replace(/_/g, " "),
            };
            return (
              <tr key={entry.id} className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${cfg.color}`}>{cfg.icon}</span>
                    <span className="text-sm font-semibold">{cfg.label}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-xs font-mono font-medium">
                    {entry.entity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{entry.actorName}</span>
                    {entry.actorRole && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {ROLE_LABELS[entry.actorRole as Role] ?? entry.actorRole}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      entry.result === "SUCCESS"
                        ? "bg-primary-container/30 text-primary"
                        : "bg-error-container/30 text-error"
                    }`}
                  >
                    {entry.result === "SUCCESS" ? "Exitoso" : "Error"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs text-on-surface-variant">
                    {new Date(entry.createdAt).toLocaleString("es-EC", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
