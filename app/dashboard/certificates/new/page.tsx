"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/src/shared/ui";

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  studentCode: string;
}

export default function NewCertificatePage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setStudents(json.data);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, title, description }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "Error al crear el certificado");
        return;
      }
      router.push("/dashboard/certificates");
    } catch {
      setError("Error de conexión");
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
          Genera un nuevo certificado académico digital vinculado a un estudiante.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2 text-on-surface">Estudiante</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">Seleccionar estudiante...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} — {s.studentCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-on-surface">
              Título del certificado
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ej: Ingeniería en Sistemas"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-on-surface">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalles adicionales del certificado..."
              className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

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
              className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all disabled:opacity-50"
            >
              {submitting ? "Creando..." : "Emitir Certificado"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
