"use client";

import { Navbar } from "@/src/shared/ui";

const MOCK_USERS = [
  { id: "1", name: "Admin Principal", email: "admin@rikuchik.ec", role: "SUPER_ADMIN" },
];

const ROLE_MAP: Record<string, { label: string; className: string }> = {
  SUPER_ADMIN: { label: "Super Admin", className: "bg-error-container text-on-error-container" },
  TENANT_ADMIN: {
    label: "Admin Tenant",
    className: "bg-tertiary-container text-on-tertiary-container",
  },
  ISSUER: { label: "Emisor", className: "bg-primary-container text-on-primary-container" },
  AUDITOR: {
    label: "Auditor",
    className: "bg-secondary-container text-on-secondary-container",
  },
};

export default function UsersPage() {
  return (
    <>
      <Navbar title="Gestión de Usuarios" />

      <div className="pt-24 px-12 pb-12">
        {/* Hero */}
        <div className="flex justify-between items-end mb-12">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-on-surface font-headline tracking-tight mb-4">
              Usuarios del Sistema
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Administra los usuarios, roles y permisos de la plataforma. Asigna roles de acceso
              según la responsabilidad institucional.
            </p>
          </div>
          <button className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all flex items-center gap-2 hover:scale-[1.02]">
            <span className="material-symbols-outlined">person_add</span>
            Invitar Usuario
          </button>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Usuario
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Email
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Rol
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {MOCK_USERS.map((user) => {
                const role = ROLE_MAP[user.role] ?? ROLE_MAP.ISSUER;
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-container-low/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container/30 text-primary flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-semibold">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-on-surface-variant">{user.email}</td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${role.className}`}
                      >
                        {role.label}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10">
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
