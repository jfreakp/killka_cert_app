"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/src/shared/ui";
import {
  createCertificateSchema,
  type CreateCertificateInput,
} from "@/src/modules/certificates/schemas";
import {
  createCertificate,
  useStudentOptions,
} from "@/src/modules/certificates/hooks";

export function CertificateForm() {
  const router = useRouter();
  const { data: students, loading: loadingStudents } = useStudentOptions();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCertificateInput>({
    resolver: zodResolver(createCertificateSchema),
    defaultValues: { studentId: "", title: "", degree: "", issueDate: "" },
  });

  async function onSubmit(data: CreateCertificateInput) {
    setServerError("");
    setSubmitting(true);
    try {
      const json = await createCertificate(data);
      if (!json.ok) {
        setServerError(json.message || "Error al crear el certificado");
        return;
      }
      router.push(`/dashboard/certificates/${json.data.id}`);
    } catch {
      setServerError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar title="Nuevo Certificado" />

      <div className="pt-24 px-12 pb-12 max-w-2xl">
        <h1 className="text-4xl font-black text-on-surface font-headline tracking-tight mb-2">
          Emitir Certificado
        </h1>
        <p className="text-on-surface-variant text-lg mb-10">
          Genera un nuevo certificado académico digital con verificación QR y hash único.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {serverError}
            </div>
          )}

          {/* Estudiante */}
          <div>
            <label className="block text-sm font-bold mb-2 text-on-surface">Estudiante *</label>
            <select
              {...register("studentId")}
              disabled={loadingStudents}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            >
              <option value="">
                {loadingStudents ? "Cargando..." : "Seleccionar estudiante..."}
              </option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} — {s.studentCode} ({s.career})
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="text-error text-xs mt-1">{errors.studentId.message}</p>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-bold mb-2 text-on-surface">
              Título del certificado *
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="Ej: Certificado de Grado en Ingeniería"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {errors.title && (
              <p className="text-error text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Carrera / Grado */}
          <div>
            <label className="block text-sm font-bold mb-2 text-on-surface">
              Carrera / Grado académico *
            </label>
            <input
              type="text"
              {...register("degree")}
              placeholder="Ej: Ingeniería en Sistemas Computacionales"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {errors.degree && (
              <p className="text-error text-xs mt-1">{errors.degree.message}</p>
            )}
          </div>

          {/* Fecha de emisión */}
          <div>
            <label className="block text-sm font-bold mb-2 text-on-surface">
              Fecha de emisión
            </label>
            <input
              type="date"
              {...register("issueDate")}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Si no se especifica, se usará la fecha actual.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low text-on-surface font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Creando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Emitir Certificado
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
