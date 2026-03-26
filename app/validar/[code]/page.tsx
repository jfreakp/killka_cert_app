interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { code } = await params;

  let result: {
    valid: boolean;
    status: string;
    studentName?: string;
    university?: string;
    title?: string;
    issuedAt?: string;
    serialNumber?: string;
    message?: string;
  } | null = null;

  try {
    const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/verification/${encodeURIComponent(code)}`, {
      cache: "no-store",
    });
    const json = await res.json();
    result = json.data ?? null;
  } catch {
    result = null;
  }

  return (
    <main className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-tertiary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary">verified</span>
          </div>
          <span className="font-headline text-2xl font-extrabold tracking-tighter text-primary">KillkaCert</span>
          <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-semibold ml-1">Validación</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-10 shadow-2xl shadow-on-surface/5 border border-outline-variant/10 relative overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary" />

          {!result ? (
            <div>
              <h1 className="text-2xl font-headline font-extrabold text-on-surface">Error de verificación</h1>
              <p className="mt-2 text-on-surface-variant">No se pudo verificar el certificado. Intenta nuevamente.</p>
            </div>
          ) : result.status === "NOT_FOUND" ? (
            <div>
              <h1 className="text-2xl font-headline font-extrabold text-error">Certificado no encontrado</h1>
              <p className="mt-2 text-on-surface-variant">
                El código <span className="font-mono font-bold">{code}</span> no corresponde a ningún certificado emitido.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-center gap-3">
                {result.valid ? (
                  <>
                    <span className="material-symbols-outlined text-3xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-container text-on-primary-container">Válido</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-3xl text-error">cancel</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-error-container/20 text-error">Revocado</span>
                  </>
                )}
              </div>

              <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-6">{result.title}</h2>

              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Estudiante</dt>
                  <dd className="mt-1 text-lg font-semibold">{result.studentName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Universidad</dt>
                  <dd className="mt-1 font-semibold">{result.university}</dd>
                </div>
                <div className="border-t border-surface-container pt-4">
                  <dt className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Número de serie</dt>
                  <dd className="mt-1 font-mono text-on-surface-variant">{result.serialNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Fecha de emisión</dt>
                  <dd className="mt-1">{result.issuedAt ? new Date(result.issuedAt).toLocaleDateString("es-EC") : "—"}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center items-center gap-2 text-on-surface-variant/60">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <span className="text-xs font-medium tracking-wide uppercase">Protegido por Polygon Proof of Stake</span>
        </div>
      </div>
    </main>
  );
}
