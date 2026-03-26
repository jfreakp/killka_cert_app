"use client";

import { useEffect, useState } from "react";
import { Navbar, PermissionGate } from "@/src/shared/ui";

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  career: string;
  email?: string | null;
}

const AVATAR_COLORS = [
  "bg-primary-container/30 text-primary",
  "bg-secondary-container/30 text-secondary",
  "bg-tertiary-container/30 text-tertiary",
  "bg-error-container/30 text-error",
];

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setStudents(json.data);
      })
      .catch(() => {});
  }, []);

  const filtered = students.filter(
    (s) =>
      !search ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Navbar title="Registro de Estudiantes">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar estudiantes por nombre o ID..."
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-80 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </Navbar>

      <div className="pt-24 px-12 pb-12">
        {/* Hero */}
        <div className="flex justify-between items-end mb-12">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-on-surface font-headline tracking-tight mb-4">
              Explorador del Registro
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Gestiona los logros académicos en la red Polygon. Sube datos en lote o genera
              credenciales individuales para el semestre actual.
            </p>
          </div>
          <div className="flex gap-4">
            <PermissionGate permission="students:create">
              <button className="px-6 py-3 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low text-primary font-bold transition-all flex items-center gap-2 group">
                <span className="material-symbols-outlined transition-transform group-hover:-translate-y-0.5">
                  upload_file
                </span>
                Cargar Excel
              </button>
              <button className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all flex items-center gap-2 hover:scale-[1.02]">
                <span className="material-symbols-outlined">person_add</span>
                Agregar Estudiante
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-surface-container-low flex justify-between items-center bg-white">
            <h3 className="font-bold text-lg">Registros Académicos Activos</h3>
            <div className="flex gap-3">
              <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Nombre del Estudiante
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  ID de Estudiante
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Curso
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Estado
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant">
                    No hay estudiantes registrados.
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className="hover:bg-surface-container-low/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                        >
                          {getInitials(s.firstName, s.lastName)}
                        </div>
                        <span className="font-semibold">
                          {s.firstName} {s.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono text-sm text-on-surface-variant">
                      {s.studentCode}
                    </td>
                    <td className="px-8 py-5 text-sm">{s.career}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-container text-on-primary-container">
                        Activo
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>{" "}
                          Ver
                        </button>
                        <PermissionGate permission="students:edit">
                          <button className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="px-8 py-4 bg-surface-container-low/30 flex justify-between items-center text-sm">
            <span className="text-on-surface-variant">
              Mostrando {filtered.length} de {students.length} estudiantes
            </span>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-lg bg-white shadow-sm hover:bg-surface-container-low transition-colors disabled:opacity-50"
                disabled
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-2 rounded-lg bg-white shadow-sm hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
