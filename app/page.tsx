import Link from "next/link";

export default function Home() {
  return (
    <body className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6 selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      {/* Background Decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full bg-primary-container/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[70%] rounded-full bg-secondary-container/30 blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-2xl">
        <div className="bg-surface-container-lowest rounded-xl p-10 shadow-[0_32px_64px_-12px_rgba(0,180,216,0.1)] border border-outline-variant/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary" />

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>generating_tokens</span>
            </div>
            <span className="font-headline text-2xl font-extrabold tracking-tighter text-primary">KillkaCert</span>
          </div>

          <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface mb-4">Certificación Académica Digital</h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Plataforma de gestión y verificación de certificados digitales académicos sobre Polygon.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Iniciar sesión
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low text-primary font-bold transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Ir al dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 text-on-surface-variant/60">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <span className="text-xs font-medium tracking-wide uppercase">Asegurado por Polygon Ledger</span>
        </div>
      </main>
    </body>
  );
}
