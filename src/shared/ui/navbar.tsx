"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
  title: string;
  children?: React.ReactNode;
}

export default function Navbar({ title, children }: NavbarProps) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AU";

  const roleName = session?.user
    ? (session.user as { role?: string }).role?.replace("_", " ") ?? "Usuario"
    : "Usuario";

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <header className="fixed top-0 right-0 left-64 bg-white/80 backdrop-blur-md shadow-sm z-30 flex justify-between items-center px-8 py-4">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-bold tracking-tighter text-primary font-headline">
          {title}
        </h2>
        {children}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:bg-primary-container rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-primary-container rounded-full transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="h-8 w-[1px] bg-outline-variant/30 mx-2" />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 pl-2 cursor-pointer group"
          >
            <div className="text-right">
              <p className="text-sm font-bold leading-none">
                {session?.user?.name ?? "Admin Usuario"}
              </p>
              <p className="text-xs text-on-surface-variant">
                {session?.user?.email ?? ""}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs">
              {initials}
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 overflow-hidden z-50">
              <div className="p-4 border-b border-surface-container-low">
                <p className="font-bold text-sm">{session?.user?.name ?? "Usuario"}</p>
                <p className="text-xs text-on-surface-variant">{session?.user?.email ?? ""}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-container/30 text-primary uppercase tracking-wider">
                  {roleName}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error-container/10 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
