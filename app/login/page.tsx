"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/src/shared/auth/schemas";

const ERROR_MAP: Record<string, string> = {
  CredentialsSignin: "Credenciales inválidas. Verifica tu correo y contraseña.",
  SessionRequired: "Debes iniciar sesión para acceder a esta página.",
  Default: "Ocurrió un error inesperado. Intenta de nuevo.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  const [serverError, setServerError] = useState(
    errorParam ? ERROR_MAP[errorParam] ?? ERROR_MAP.Default : "",
  );
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setServerError("");

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setServerError(ERROR_MAP[res.error] ?? ERROR_MAP.Default);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <body className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6 selection:bg-primary-container selection:text-on-primary-container">
      {/* Background Decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full bg-primary-container/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[70%] rounded-full bg-secondary-container/30 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-[1200px] grid lg:grid-cols-2 items-center gap-12">
        {/* Branding Section */}
        <div className="hidden lg:flex flex-col space-y-8 pl-16">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-surface-container-lowest" style={{ fontVariationSettings: "'FILL' 1" }}>generating_tokens</span>
            </div>
            <span className="font-headline text-3xl font-extrabold tracking-tighter text-primary">KillkaCert</span>
          </div>

          <h1 className="font-headline text-6xl font-extrabold tracking-tighter leading-tight text-on-surface">
            El Registro de <span className="text-primary-dim">Confianza</span> Permanente.
          </h1>

          <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
            Experimente la precisión arquitectónica del archivo digital. Sus certificados de Polygon, asegurados con la reverencia de una galería física.
          </p>

          <div className="pt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-surface shadow-sm bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container">AU</div>
              <div className="w-10 h-10 rounded-full border-2 border-surface shadow-sm bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container">MR</div>
              <div className="w-10 h-10 rounded-full border-2 border-surface shadow-sm bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface-variant">JL</div>
            </div>
            <span className="text-sm font-medium text-on-surface-variant">Con la confianza de más de 2,000 instituciones</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-surface-container-lowest p-10 lg:p-12 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,180,216,0.1)] relative overflow-hidden">
            {/* Gradient Line at top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary" />

            {/* Card Header */}
            <div className="mb-10">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center space-x-2 mb-8">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>generating_tokens</span>
                <span className="font-headline text-xl font-black text-primary">KillkaCert</span>
              </div>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Bienvenido de nuevo</h2>
              <p className="text-on-surface-variant font-medium">Inicia sesión para gestionar certificados en Polygon.</p>
            </div>

            {serverError && (
              <div className="mb-4 rounded-lg bg-error-container/10 border border-error-container/30 px-4 py-3 text-sm font-medium text-error flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {serverError}
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email Field */}
              <div className="space-y-2 group">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Correo electrónico
                </label>
                <div className={`relative bg-surface-container-high/30 rounded-t-lg transition-all input-accent ${errors.email ? "border-b-2 border-error" : ""}`}>
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">mail</span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@institucion.edu"
                    className="w-full bg-transparent border-none py-4 pl-12 pr-4 focus:ring-0 text-on-surface placeholder:text-outline/50 font-medium"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-error font-medium ml-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2 group">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Contraseña
                  </label>
                </div>
                <div className={`relative bg-surface-container-high/30 rounded-t-lg transition-all input-accent ${errors.password ? "border-b-2 border-error" : ""}`}>
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">lock</span>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-transparent border-none py-4 pl-12 pr-12 focus:ring-0 text-on-surface placeholder:text-outline/50 font-medium"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error font-medium ml-1">{errors.password.message}</p>
                )}
                <div className="flex justify-end">
                  <Link href="/reset-password" className="text-sm font-semibold text-primary hover:text-primary-dim transition-colors mt-1">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 px-6 rounded-md transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Info */}
            <div className="mt-12 pt-8 border-t border-surface-container flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="text-xs font-medium tracking-wide uppercase">Asegurado por Polygon Ledger</span>
              </div>
              <p className="text-xs text-on-surface-variant text-center">
                ¿No tienes cuenta? <Link href="#" className="text-primary font-bold hover:underline">Solicita acceso</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Support Button */}
      <div className="fixed bottom-8 right-8 z-20">
        <button className="bg-surface-container-lowest p-3 rounded-full shadow-lg border border-surface-container-high hover:bg-primary-container/10 transition-colors group">
          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">contact_support</span>
        </button>
      </div>
    </body>
  );
}
