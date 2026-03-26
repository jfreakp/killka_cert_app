"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Navbar, PermissionGate } from "@/src/shared/ui";
import { usePermissions } from "@/src/shared/auth/hooks";
import { ROLE_LABELS, type Role } from "@/src/shared/auth/permissions";
import { useDashboardMetrics, useDashboardActivity } from "@/src/modules/dashboard/hooks";
import { MetricCard, ActivityTable, CertificateChart } from "@/src/modules/dashboard/components";

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

  const { data: metrics, loading: metricsLoading } = useDashboardMetrics();
  const { data: activity, loading: activityLoading } = useDashboardActivity();

  const fmt = (n?: number) => (n != null ? n.toLocaleString() : "—");

  return (
    <>
      <Navbar title="Panel de Control" />
      <div className="pt-24 px-12 pb-12">
        {/* Forbidden alert */}
        {forbidden && (
          <div className="mb-6 rounded-xl bg-error-container/10 border border-error-container/30 px-5 py-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-error">block</span>
            <p className="text-sm font-medium text-error">No tienes permisos para acceder a esa sección.</p>
          </div>
        )}

        {/* Hero Header */}
        <div className="flex justify-between items-end mb-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-on-surface font-headline tracking-tight mb-4">
              Bienvenido, {session?.user?.name ?? "Admin"}
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Gestiona los logros académicos en la red Polygon. Vista general del estado de la plataforma.
            </p>
            {role && (
              <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold bg-primary-container/30 text-primary uppercase tracking-wider">
                {ROLE_LABELS[role as Role]}
              </span>
            )}
          </div>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            label="Certificados Emitidos"
            value={fmt(metrics?.totalIssued)}
            icon="verified"
            accent="tertiary"
            trend={metrics ? `+${metrics.issuedLast30} últimos 30d` : undefined}
            trendUp
          />
          <MetricCard
            label="Estudiantes Registrados"
            value={fmt(metrics?.totalStudents)}
            icon="school"
            accent="primary"
            trend={metrics ? `+${metrics.studentsLast30} nuevos` : undefined}
            trendUp
          />
          <MetricCard
            label="Verificaciones Pendientes"
            value={fmt(metrics?.totalPending)}
            icon="pending_actions"
            accent="secondary"
          />
          <MetricCard
            label="Certificados Revocados"
            value={fmt(metrics?.totalRevoked)}
            icon="gpp_bad"
            accent="error"
          />
        </div>

        {/* ── Chart + Status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            <CertificateChart
              data={metrics?.chartData ?? []}
              loading={metricsLoading}
            />
          </div>

          {/* Status Summary */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 flex flex-col gap-6">
            <h3 className="font-bold text-lg text-on-surface">Resumen de Estado</h3>

            <StatusRow
              label="Emitidos"
              value={metrics?.totalIssued ?? 0}
              total={(metrics?.totalIssued ?? 0) + (metrics?.totalPending ?? 0) + (metrics?.totalRevoked ?? 0)}
              color="bg-tertiary"
            />
            <StatusRow
              label="Pendientes"
              value={metrics?.totalPending ?? 0}
              total={(metrics?.totalIssued ?? 0) + (metrics?.totalPending ?? 0) + (metrics?.totalRevoked ?? 0)}
              color="bg-secondary"
            />
            <StatusRow
              label="Revocados"
              value={metrics?.totalRevoked ?? 0}
              total={(metrics?.totalIssued ?? 0) + (metrics?.totalPending ?? 0) + (metrics?.totalRevoked ?? 0)}
              color="bg-error"
            />

            <div className="mt-auto pt-4 border-t border-surface-container-low">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span className="text-xs font-medium">Los datos se actualizan en tiempo real</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
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

        {/* ── Activity Table ── */}
        <ActivityTable entries={activity ?? []} loading={activityLoading} />
      </div>
    </>
  );
}

/* ─── Sub-components ─── */

function StatusRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-semibold text-on-surface">{label}</span>
        <span className="text-sm font-bold text-on-surface-variant">{value} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-surface-container-low overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
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
