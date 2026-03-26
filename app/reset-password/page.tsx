"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  requestResetSchema,
  resetPasswordSchema,
  type RequestResetInput,
  type ResetPasswordInput,
} from "@/src/shared/auth/schemas";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <body className="bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-tertiary/5 blur-[120px]" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Logo Branding */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-on-primary">generating_tokens</span>
            </div>
            <span className="text-2xl font-headline font-extrabold tracking-tighter text-primary">KillkaCert</span>
          </div>
          <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-semibold">Libro Mayor Polygon</span>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest shadow-2xl shadow-on-surface/5 rounded-xl p-8 md:p-10 border border-outline-variant/10">
          {token ? <ResetForm token={token} /> : <RequestForm />}
        </div>

        {/* Footer / Support */}
        <div className="mt-10 flex flex-col items-center space-y-4">
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs font-label text-on-surface-variant hover:text-primary transition-colors">
              Política de Privacidad
            </Link>
            <Link href="#" className="text-xs font-label text-on-surface-variant hover:text-primary transition-colors">
              Centro de Soporte
            </Link>
          </div>
          <p className="text-[10px] font-label text-on-surface-variant/60 text-center uppercase tracking-widest">
            Protegido por Polygon Proof of Stake
          </p>
        </div>
      </main>

      {/* Right Side Visual (desktop) */}
      <div className="fixed right-0 top-0 bottom-0 w-1/3 hidden lg:block overflow-hidden">
        <div className="w-full h-full relative bg-gradient-to-br from-primary-container/30 to-secondary-container/20">
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
          <div className="absolute bottom-20 left-12 max-w-xs space-y-4">
            <div className="h-px w-12 bg-primary" />
            <p className="text-on-surface font-headline font-extrabold text-3xl leading-tight">
              Asegurando la <span className="text-primary">permanencia</span> de la excelencia académica.
            </p>
          </div>
        </div>
      </div>
    </body>
  );
}

/* ─── Step 1: Request reset link ─── */
function RequestForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetInput>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: RequestResetInput) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        setServerError(json.message || "Error al solicitar recuperación.");
        return;
      }
      setSuccess(true);
    } catch {
      setServerError("Error de conexión. Intenta de nuevo.");
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-primary-container/30 text-primary flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl">mark_email_read</span>
        </div>
        <h2 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Revisa tu correo</h2>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
          Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dim transition-colors group"
        >
          <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">chevron_left</span>
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-3">¿Olvidaste tu contraseña?</h1>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg bg-error-container/10 border border-error-container/30 px-4 py-3 text-sm font-medium text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-label font-bold text-on-surface uppercase tracking-wider ml-1">
            Correo Registrado
          </label>
          <div className={`relative group ${errors.email ? "border-b-2 border-error" : ""}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">mail</span>
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@universidad.edu"
              className="block w-full pl-10 pr-4 py-3 bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/50 rounded-t-lg"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-error font-medium ml-1">{errors.email.message}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 py-4 px-6 bg-primary text-on-primary font-headline font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                Enviando...
              </>
            ) : (
              <>
                Enviar Enlace
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dim transition-colors duration-200 group"
        >
          <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">chevron_left</span>
          Volver al Inicio
        </Link>
      </div>
    </>
  );
}

/* ─── Step 2: Reset with token ─── */
function ResetForm({ token }: { token: string }) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setServerError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        setServerError(json.message || "Error al restablecer la contraseña.");
        return;
      }
      setSuccess(true);
    } catch {
      setServerError("Error de conexión. Intenta de nuevo.");
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-primary-container/30 text-primary flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight mb-2">¡Contraseña actualizada!</h2>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
          Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          Iniciar Sesión
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-3">Restablecer contraseña</h1>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          Ingresa tu nueva contraseña. Debe ser segura y única.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg bg-error-container/10 border border-error-container/30 px-4 py-3 text-sm font-medium text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <input type="hidden" {...register("token")} />

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-label font-bold text-on-surface uppercase tracking-wider ml-1">
            Nueva Contraseña
          </label>
          <div className={`relative ${errors.password ? "border-b-2 border-error" : ""}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">lock</span>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              className="block w-full pl-10 pr-12 py-3 bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/50 rounded-t-lg"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-error font-medium ml-1">{errors.password.message}</p>
          )}
          <p className="text-[11px] text-on-surface-variant ml-1">Letras, números y al menos un carácter especial</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-label font-bold text-on-surface uppercase tracking-wider ml-1">
            Confirmar Contraseña
          </label>
          <div className={`relative ${errors.confirmPassword ? "border-b-2 border-error" : ""}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">lock_reset</span>
            </div>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              className="block w-full pl-10 pr-4 py-3 bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/50 rounded-t-lg"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-error font-medium ml-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 py-4 px-6 bg-primary text-on-primary font-headline font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                Actualizando...
              </>
            ) : (
              <>
                Restablecer Contraseña
                <span className="material-symbols-outlined text-xl">lock_open</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dim transition-colors duration-200 group"
        >
          <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">chevron_left</span>
          Volver al Inicio
        </Link>
      </div>
    </>
  );
}
