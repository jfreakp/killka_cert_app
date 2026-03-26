"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Panel de Control", icon: "dashboard", href: "/dashboard" },
  { label: "Estudiantes", icon: "group", href: "/dashboard/students" },
  { label: "Certificados", icon: "generating_tokens", href: "/dashboard/certificates" },
  { label: "Usuarios", icon: "manage_accounts", href: "/dashboard/users" },
  { label: "Auditoría", icon: "history", href: "/dashboard/audit" },
  { label: "Configuración", icon: "settings", href: "/dashboard/settings" },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Soporte", icon: "contact_support", href: "#" },
  { label: "Cuenta", icon: "person", href: "#" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col p-4 space-y-2 z-40">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-black text-primary font-headline">KillkaCert</h1>
        <p className="text-xs text-on-surface-variant font-medium tracking-widest uppercase">
          Polygon Ledger
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive(item.href)
                ? "flex items-center gap-3 px-3 py-2.5 bg-white text-primary rounded-lg shadow-sm font-bold font-headline text-sm"
                : "flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-primary hover:translate-x-1 transition-transform duration-200 font-headline font-medium text-sm"
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4 space-y-1">
        <Link
          href="/dashboard/certificates/new"
          className="w-full mb-4 bg-primary text-on-primary py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-dim transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Nuevo Certificado</span>
        </Link>
        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-primary font-headline text-sm"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
