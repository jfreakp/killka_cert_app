"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

/* ── Types ── */

interface VerificationResult {
  valid: boolean;
  status: string;
  integrityValid?: boolean;
  studentName?: string;
  studentCode?: string;
  university?: string;
  title?: string;
  degree?: string;
  issuedAt?: string;
  revokedAt?: string;
  serialNumber?: string;
  pdfUrl?: string;
  message?: string;
}

type Mode = "input" | "scanner";
type Phase = "idle" | "loading" | "result";

/* ── Page ── */

export default function VerifyLandingPage() {
  const [mode, setMode] = useState<Mode>("input");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* focus input on mode switch */
  useEffect(() => {
    if (mode === "input" && phase === "idle") inputRef.current?.focus();
  }, [mode, phase]);

  /* ── Verify ── */
  async function verify(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    setPhase("loading");
    setResult(null);

    try {
      const res = await fetch(`/api/verification/${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (json.ok) {
        setResult(json.data);
      } else {
        setResult({ valid: false, status: "ERROR", message: "Error al verificar" });
      }
    } catch {
      setResult({ valid: false, status: "ERROR", message: "Error de conexión" });
    } finally {
      setPhase("result");
    }
  }

  function reset() {
    setPhase("idle");
    setResult(null);
    setCode("");
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-tertiary/5 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-12">
        {/* Brand */}
        <Link href="/" className="mb-2">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-on-primary">verified</span>
            </div>
            <span className="font-headline text-2xl font-extrabold tracking-tighter text-primary">
              KillkaCert
            </span>
          </div>
        </Link>
        <p className="text-xs text-on-surface-variant mb-10 uppercase tracking-widest font-semibold">
          Verificación de Certificados
        </p>

        {/* ── IDLE / INPUT ── */}
        {phase === "idle" && (
          <div className="w-full max-w-lg">
            {/* Hero text */}
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-black font-headline text-on-surface tracking-tight mb-3">
                Valida tu certificado
              </h1>
              <p className="text-on-surface-variant max-w-md mx-auto">
                Ingresa el código de verificación o escanea el código QR impreso en tu certificado
                para comprobar su autenticidad.
              </p>
            </div>

            {/* Mode tabs */}
            <div className="flex bg-surface-container-low rounded-2xl p-1 mb-6">
              <button
                onClick={() => setMode("input")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  mode === "input"
                    ? "bg-surface-container-lowest shadow-sm text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">keyboard</span>
                Código / Hash
              </button>
              <button
                onClick={() => setMode("scanner")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  mode === "scanner"
                    ? "bg-surface-container-lowest shadow-sm text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                Escanear QR
              </button>
            </div>

            {/* Input mode */}
            {mode === "input" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verify(code);
                }}
                className="space-y-4"
              >
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                    search
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Código UUID o hash SHA-256..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 text-base focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm font-mono placeholder:font-sans placeholder:text-on-surface-variant/50"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!code.trim()}
                  className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  Verificar Certificado
                </button>
              </form>
            )}

            {/* Scanner mode (simulated) */}
            {mode === "scanner" && <QrScanner onScan={verify} />}

            {/* Help */}
            <div className="mt-8 bg-surface-container-low/60 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-primary">help</span>
                ¿Dónde encuentro el código?
              </h3>
              <div className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary shrink-0">
                    description
                  </span>
                  El código UUID aparece debajo del QR impreso en tu certificado físico o digital.
                </p>
                <p className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary shrink-0">
                    qr_code_2
                  </span>
                  También puedes escanear directamente el código QR del certificado.
                </p>
                <p className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary shrink-0">
                    tag
                  </span>
                  El hash SHA-256 está impreso al pie del documento para validación avanzada.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {phase === "loading" && (
          <div className="w-full max-w-lg">
            <div className="bg-surface-container-lowest rounded-3xl shadow-lg p-16 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <span className="material-symbols-outlined animate-spin text-primary text-[48px] absolute inset-0 flex items-center justify-center">
                  progress_activity
                </span>
              </div>
              <h2 className="text-xl font-bold font-headline text-on-surface mb-2">
                Verificando...
              </h2>
              <p className="text-on-surface-variant text-sm">
                Validando integridad criptográfica del certificado
              </p>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && result && (
          <div className="w-full max-w-lg">
            <ResultCard result={result} />

            <button
              onClick={reset}
              className="mt-6 w-full py-3 rounded-2xl border border-outline-variant/20 text-on-surface font-bold hover:bg-surface-container-low transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              Nueva verificación
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-on-surface-variant/50 mb-2">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <span className="text-xs font-medium uppercase tracking-wider">
              Protegido con hash SHA-256
            </span>
          </div>
          <p className="text-xs text-on-surface-variant/40">
            Sistema de verificación operado por KillkaCert &bull; Integridad garantizada por
            criptografía
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   QR Scanner (Simulated UI)
   ══════════════════════════════════════════ */

function QrScanner({ onScan }: { onScan: (code: string) => void }) {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  /* Simulate a scan: user picks an image → we "detect" a code from it.
     In a real implementation this would use a camera stream + jsQR. */
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);

    /* Simulate scan delay */
    setTimeout(() => {
      setScanning(false);
      /* Extract code from filename as demo fallback, or prompt manual entry */
      const promptResult = prompt(
        "Ingresa el código detectado del QR (simula el resultado del escaneo):",
      );
      if (promptResult?.trim()) {
        onScan(promptResult.trim());
      }
      if (fileRef.current) fileRef.current.value = "";
    }, 1500);
  }

  return (
    <div className="space-y-4">
      {/* Camera viewfinder simulation */}
      <div className="relative bg-on-surface rounded-2xl overflow-hidden aspect-square max-h-[300px] mx-auto flex items-center justify-center">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary rounded-br-xl" />
        </div>

        {/* Scan line */}
        {scanning && (
          <div className="absolute inset-x-4 h-0.5 bg-primary/80 shadow-[0_0_12px_rgba(0,180,216,0.6)] animate-bounce" />
        )}

        <div className="text-center z-10">
          <span
            className={`material-symbols-outlined text-[56px] ${
              scanning ? "text-primary animate-pulse" : "text-white/30"
            }`}
          >
            {scanning ? "qr_code_scanner" : "photo_camera"}
          </span>
          <p className="text-white/50 text-sm mt-2">
            {scanning ? "Escaneando..." : "Cámara simulada"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <label className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all flex items-center justify-center gap-2 cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          {scanning ? "Escaneando..." : "Capturar QR"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={scanning}
            className="hidden"
            capture="environment"
          />
        </label>
      </div>

      {/* Manual fallback */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/20" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-3 text-xs text-on-surface-variant">
            o ingresa el código manualmente
          </span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manualCode.trim()) onScan(manualCode.trim());
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Código del QR..."
          className="flex-1 px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <button
          type="submit"
          disabled={!manualCode.trim()}
          className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-dim transition-all disabled:opacity-40"
        >
          Verificar
        </button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════
   Result Card
   ══════════════════════════════════════════ */

function ResultCard({ result }: { result: VerificationResult }) {
  /* NOT FOUND */
  if (result.status === "NOT_FOUND") {
    return (
      <div className="bg-surface-container-lowest rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-surface-container-high py-8 px-8 text-center">
          <span className="material-symbols-outlined text-[56px] text-error block mb-3">
            cancel
          </span>
          <h2 className="text-2xl font-black font-headline text-on-surface">
            Certificado No Encontrado
          </h2>
          <p className="text-on-surface-variant text-sm mt-2">
            El código ingresado no corresponde a ningún certificado registrado en el sistema.
          </p>
        </div>
        <div className="p-6 text-center text-sm text-on-surface-variant">
          Verifica que el código sea correcto e intenta nuevamente.
        </div>
      </div>
    );
  }

  /* ERROR */
  if (result.status === "ERROR") {
    return (
      <div className="bg-surface-container-lowest rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-error-container/20 py-8 px-8 text-center">
          <span className="material-symbols-outlined text-[56px] text-error block mb-3">
            error
          </span>
          <h2 className="text-2xl font-black font-headline text-error">Error de Verificación</h2>
          <p className="text-on-surface-variant text-sm mt-2">{result.message}</p>
        </div>
      </div>
    );
  }

  /* REVOKED */
  if (result.status === "REVOKED") {
    return (
      <div className="bg-surface-container-lowest rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-error-container/15 py-8 px-8 text-center">
          <span className="material-symbols-outlined text-[56px] text-error block mb-3">
            block
          </span>
          <h2 className="text-2xl font-black font-headline text-error">Certificado Revocado</h2>
          <p className="text-on-surface-variant text-sm mt-2">
            Este certificado fue revocado por la institución emisora.
          </p>
        </div>

        <div className="p-6 space-y-0">
          <StatusBadge valid={false} label="INVÁLIDO" />
          <InfoRow label="Estudiante" value={result.studentName} />
          <InfoRow label="Título" value={result.title} />
          {result.degree && result.degree !== result.title && (
            <InfoRow label="Carrera" value={result.degree} />
          )}
          <InfoRow label="Universidad" value={result.university} />
          <InfoRow label="Serial" value={result.serialNumber} />
          {result.revokedAt && (
            <InfoRow
              label="Revocado el"
              value={new Date(result.revokedAt).toLocaleDateString("es-EC", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
          )}
        </div>
      </div>
    );
  }

  /* VALID or INTEGRITY ISSUE */
  const isValid = result.valid === true;

  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-lg overflow-hidden">
      {/* Banner */}
      <div
        className={`py-8 px-8 text-center ${
          isValid ? "bg-primary-container" : "bg-error-container/15"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[56px] block mb-3 ${
            isValid ? "text-on-primary-container" : "text-error"
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isValid ? "verified" : "gpp_bad"}
        </span>
        <h2
          className={`text-2xl font-black font-headline ${
            isValid ? "text-on-primary-container" : "text-error"
          }`}
        >
          {isValid ? "Certificado Válido" : "Integridad Comprometida"}
        </h2>
        {!isValid && result.integrityValid === false && (
          <p className="text-sm text-error/80 mt-2">
            El hash criptográfico no coincide. El documento puede haber sido alterado.
          </p>
        )}
      </div>

      {/* Details */}
      <div className="p-6 space-y-0">
        <StatusBadge valid={isValid} label={isValid ? "VÁLIDO" : "INVÁLIDO"} />
        <InfoRow label="Estudiante" value={result.studentName} />
        {result.studentCode && <InfoRow label="Código" value={result.studentCode} />}
        <InfoRow label="Título" value={result.title} />
        {result.degree && result.degree !== result.title && (
          <InfoRow label="Carrera" value={result.degree} />
        )}
        <InfoRow label="Universidad" value={result.university} />
        <InfoRow label="Nro. Serial" value={result.serialNumber} />
        {result.issuedAt && (
          <InfoRow
            label="Fecha de emisión"
            value={new Date(result.issuedAt).toLocaleDateString("es-EC", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
        )}

        {/* Integrity */}
        <div className="pt-4 mt-4 border-t border-outline-variant/10">
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-[16px] ${
                result.integrityValid ? "text-primary" : "text-error"
              }`}
            >
              {result.integrityValid ? "shield" : "gpp_bad"}
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">
              Hash SHA-256:{" "}
              {result.integrityValid ? "Integridad verificada" : "Integridad comprometida"}
            </span>
          </div>
        </div>

        {/* PDF download */}
        {result.pdfUrl && (
          <a
            href={result.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-dim transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Descargar Certificado PDF
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ── */

function StatusBadge({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <span
        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-black tracking-wider ${
          valid
            ? "bg-primary-container text-on-primary-container"
            : "bg-error-container/20 text-error"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {valid ? "check_circle" : "cancel"}
        </span>
        {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-outline-variant/10 last:border-0">
      <span className="text-sm text-on-surface-variant shrink-0">{label}</span>
      <span className="text-sm font-semibold text-on-surface text-right">{value}</span>
    </div>
  );
}
