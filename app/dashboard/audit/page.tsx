"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/src/shared/ui";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  performedBy: string;
  createdAt: string;
  details?: string | null;
}

const ACTION_ICONS: Record<string, string> = {
  CREATE: "add_circle",
  UPDATE: "edit",
  DELETE: "delete",
  ISSUE: "verified",
  REVOKE: "block",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setLogs(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar title="Registro de Auditoría" />

      <div className="pt-24 px-12 pb-12">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-on-surface font-headline tracking-tight mb-4">
            Registro de Auditoría
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
            Historial completo de todas las acciones realizadas en la plataforma. Cada operación
            queda registrada para garantizar la trazabilidad institucional.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
              <p className="mt-4">Cargando registros...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-3xl">
              <span className="material-symbols-outlined text-5xl mb-4 block opacity-40">
                history
              </span>
              <p>No hay registros de auditoría.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">
                    {ACTION_ICONS[log.action] ?? "info"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{log.action}</span>
                    <span className="text-xs text-on-surface-variant">en</span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-xs font-mono">
                      {log.entity}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Realizado por <span className="font-semibold">{log.performedBy}</span>
                    {log.details && <span> — {log.details}</span>}
                  </p>
                </div>
                <span className="text-xs text-on-surface-variant whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("es-EC")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
