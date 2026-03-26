"use client";

import { useSession } from "next-auth/react";
import { Sidebar, PermissionGate } from "@/src/shared/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  // Proxy already handles server-side redirect for unauthenticated users.
  // This is a secondary guard: show loading while session resolves.
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <Sidebar />
      <main className="ml-64 min-h-screen">{children}</main>

      {/* Floating Action Button — only for users who can create certificates */}
      <PermissionGate permission="certificates:create">
        <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
          <span
            className="material-symbols-outlined text-3xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 600" }}
          >
            add
          </span>
        </button>
      </PermissionGate>
    </div>
  );
}
