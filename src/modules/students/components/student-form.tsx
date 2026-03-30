"use client";

import { useState } from "react";

export interface StudentFormProps {
  onSubmit: (data: {
    studentCode: string;
    firstName: string;
    lastName: string;
    email?: string;
    career: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function StudentForm({ onSubmit, onClose }: StudentFormProps) {
  const [form, setForm] = useState({
    studentCode: "",
    firstName: "",
    lastName: "",
    email: "",
    career: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar estudiante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-2">Agregar Estudiante</h2>
        <input
          name="studentCode"
          placeholder="Código de estudiante"
          value={form.studentCode}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        />
        <input
          name="firstName"
          placeholder="Nombres"
          value={form.firstName}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        />
        <input
          name="lastName"
          placeholder="Apellidos"
          value={form.lastName}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        />
        <input
          name="email"
          placeholder="Correo electrónico (opcional)"
          value={form.email}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          type="email"
        />
        <input
          name="career"
          placeholder="Carrera"
          value={form.career}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 justify-end mt-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-primary text-white font-bold hover:bg-primary-dim"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
