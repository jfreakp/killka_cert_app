"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Navbar, PermissionGate } from "@/src/shared/ui";
import { usePermissions } from "@/src/shared/auth/hooks";
import { ROLE_LABELS, type Role } from "@/src/shared/auth/permissions";

interface Metrics {
  totalStudents: number;
  totalIssued: number;
  totalPending: number;
  totalRevoked: number;
  healthScore: number;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const { can, role } = usePermissions();
  const searchParams = useSearchParams();
  const forbidden = searchParams.get("forbidden");
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setMetrics(json.data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar title="Panel de Control" />
      <div className="pt-24 px-12 pb-12">
        {/* Forbidden alert */}
        {forbidden && (
          <div className="mb-6 rounded-xl bg-error-container/10 border border-error-container/30 px-5 py-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-error">block</span>
            <p className="text-sm font-medium text-error">No tienes permisos para acceder a esa secci\u00F3n.</p>
          </div>
        )}

        {/* Hero Header */}
        <div className="flex justify-between items-end mb-12">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-on-surface font-headline tracking-tight mb-4">
              Bienvenido, {session?.user?.name ?? "Admin"}
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Gestiona los logros acad\u00E9micos en la red Polygon. Vista general del estado de la plataforma.
            </p>
            {role && (
              <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold bg-primary-container/30 text-primary uppercase tracking-wider">
                {ROLE_LABELS[role as Role]}
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <MetricCard
            label="Total de Estudiantes"
            value={metrics ? metrics.totalStudents.toLocaleString() : "—"}
            color="text-primary"
          />
          <MetricCard
            label="Certificados Emitidos"
            value={metrics ? metrics.totalIssued.toLocaleString() : "—"}
            color="text-tertiary"
          />
          <MetricCard
            label="Verificaciones Pendientes"
            value={metrics ? metrics.totalPending.toLocaleString() : "—"}
            color="text-secondary"
          />
          <div className="bg-primary bg-gradient-to-br from-primary to-primary-dim p-6 rounded-2xl border-none shadow-sm flex flex-col justify-between h-32 text-on-primary">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">
              Salud del Ledger
            </span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black font-headline">
                {metrics ? `${metrics.healthScore}%` : "—"}
              </span>
              <span className="text-sm pb-1 font-bold">Uptime</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6">
          <PermissionGate permission="students:create">
            <QuickActionCard
              icon="group"
              title="Registrar Estudiantes"
              description="Agrega nuevos estudiantes o importa datos en lote."
              href="/dashboard/students"
            />
          </PermissionGate>
          <PermissionGate permission="certificates:create">
            <QuickActionCard
              icon="generating_tokens"
              title="Emitir Certificados"
              description="Genera certificados individuales o masivos."
              href="/dashboard/certificates"
            />
          </PermissionGate>
          <PermissionGate permission="audit:list">
            <QuickActionCard
              icon="history"
              title="Ver Auditoría"
              description="Revisa el historial de acciones del sistema."
              href="/dashboard/audit"
            />
          </PermissionGate>
        </div>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border-none shadow-sm flex flex-col justify-between h-32">
      <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <span className={`text-3xl font-black font-headline ${color}`}>{value}</span>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group block"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
    </a>
  );
}
