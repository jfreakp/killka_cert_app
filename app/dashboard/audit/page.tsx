"use client";

import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/src/shared/ui";

/* ── Types ── */

interface Actor {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  result: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  actor: Actor | null;
  createdAt: string;
}

interface Filters {
  action: string;
  entity: string;
  result: string;
  search: string;
  from: string;
  to: string;
}

interface ApiResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  filters: { actions: string[]; entities: string[] };
}

/* ── Icons ── */

const ACTION_ICONS: Record<string, string> = {
  LOGIN: "login",
  FAILED_LOGIN: "lock",
  LOGOUT: "logout",
  ISSUE_CERTIFICATE: "verified",
  REVOKE_CERTIFICATE: "block",
  UPLOAD_PDF: "upload_file",
  VERIFY_CERTIFICATE: "qr_code_scanner",
  CREATE_STUDENT: "person_add",
  UPDATE_STUDENT: "edit",
  DELETE_STUDENT: "person_remove",
  CREATE_USER: "group_add",
  UPDATE_USER: "manage_accounts",
  DELETE_USER: "group_remove",
};

const RESULT_STYLES: Record<string, string> = {
  SUCCESS: "bg-tertiary-container/40 text-on-tertiary-container",
  FAILURE: "bg-error-container/40 text-on-error-container",
};

/* ── Component ── */

export default function AuditPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    action: "",
    entity: "",
    result: "",
    search: "",
    from: "",
    to: "",
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "30");
    if (filters.action) params.set("action", filters.action);
    if (filters.entity) params.set("entity", filters.entity);
    if (filters.result) params.set("result", filters.result);
    if (filters.search) params.set("search", filters.search);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);

    try {
      const res = await fetch(`/api/audit?${params}`);
      const json = await res.json();
      if (json.ok) setData(json.data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ action: "", entity: "", result: "", search: "", from: "", to: "" });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <Navbar title="Registro de Auditoría" />

      <div className="pt-24 px-12 pb-12">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-5xl font-black text-on-surface font-headline tracking-tight mb-4">
            Registro de Auditoría
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
            Historial completo de todas las acciones realizadas en la plataforma. Cada operación
            queda registrada para garantizar la trazabilidad institucional.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary">filter_alt</span>
            <span className="font-bold text-on-surface">Filtros</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">clear_all</span>
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="text-xs text-on-surface-variant mb-1 block">Buscar</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Acción, entidad, usuario..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Action */}
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Acción</label>
              <select
                value={filters.action}
                onChange={(e) => updateFilter("action", e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Todas</option>
                {data?.filters.actions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity */}
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Entidad</label>
              <select
                value={filters.entity}
                onChange={(e) => updateFilter("entity", e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Todas</option>
                {data?.filters.entities.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* Result */}
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Resultado</label>
              <select
                value={filters.result}
                onChange={(e) => updateFilter("result", e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Todos</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILURE">FAILURE</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Desde</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => updateFilter("from", e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Hasta</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => updateFilter("to", e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Total count */}
        {data && !loading && (
          <p className="text-sm text-on-surface-variant mb-4">
            {data.total} registro{data.total !== 1 ? "s" : ""} encontrado{data.total !== 1 ? "s" : ""}
          </p>
        )}

        {/* Log list */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
              <p className="mt-4">Cargando registros...</p>
            </div>
          ) : !data || data.logs.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-3xl">
              <span className="material-symbols-outlined text-5xl mb-4 block opacity-40">history</span>
              <p>No hay registros de auditoría.</p>
            </div>
          ) : (
            data.logs.map((log) => (
              <div key={log.id} className="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-all">
                <button
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  className="w-full p-5 flex items-start gap-4 text-left"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">
                      {ACTION_ICONS[log.action] ?? "info"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm">{log.action}</span>
                      <span className="text-xs text-on-surface-variant">en</span>
                      <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-xs font-mono">
                        {log.entity}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${RESULT_STYLES[log.result] ?? "bg-surface-container-low text-on-surface-variant"}`}>
                        {log.result}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {log.actor ? (
                        <>
                          <span className="font-semibold">{log.actor.name ?? log.actor.email}</span>
                          <span className="opacity-60"> ({log.actor.role})</span>
                        </>
                      ) : (
                        <span className="italic">Sistema / Anónimo</span>
                      )}
                      {log.entityId && (
                        <span className="ml-2 opacity-60 font-mono text-xs">ID: {log.entityId.slice(0, 8)}…</span>
                      )}
                    </p>
                  </div>

                  {/* Datetime + expand icon */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-on-surface-variant whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("es-EC")}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-lg transition-transform" style={{ transform: expanded === log.id ? "rotate(180deg)" : "none" }}>
                      expand_more
                    </span>
                  </div>
                </button>

                {/* Expanded details */}
                {expanded === log.id && (
                  <div className="px-5 pb-5 pt-0 border-t border-outline-variant/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                      {log.ipAddress && (
                        <div>
                          <span className="text-xs text-on-surface-variant block">IP</span>
                          <span className="font-mono">{log.ipAddress}</span>
                        </div>
                      )}
                      {log.userAgent && (
                        <div>
                          <span className="text-xs text-on-surface-variant block">User Agent</span>
                          <span className="font-mono text-xs break-all">{log.userAgent}</span>
                        </div>
                      )}
                      {log.entityId && (
                        <div>
                          <span className="text-xs text-on-surface-variant block">Entity ID</span>
                          <span className="font-mono text-xs">{log.entityId}</span>
                        </div>
                      )}
                      {log.actor?.email && (
                        <div>
                          <span className="text-xs text-on-surface-variant block">Email</span>
                          <span>{log.actor.email}</span>
                        </div>
                      )}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-4">
                        <span className="text-xs text-on-surface-variant block mb-1">Detalles</span>
                        <pre className="bg-surface-container-low rounded-xl p-3 text-xs font-mono overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl bg-surface-container-low text-sm font-medium disabled:opacity-40 hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-lg align-middle">chevron_left</span>
            </button>
            <span className="text-sm text-on-surface-variant px-4">
              Página {page} de {data.pages}
            </span>
            <button
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl bg-surface-container-low text-sm font-medium disabled:opacity-40 hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-lg align-middle">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
