"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";

export interface ExcelUploadProps {
  onSubmit: (students: Array<{
    studentCode: string;
    firstName: string;
    lastName: string;
    email?: string;
    career: string;
  }>) => Promise<void>;
  onClose: () => void;
}

export function ExcelUpload({ onSubmit, onClose }: ExcelUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);
      // Espera columnas: studentCode, firstName, lastName, email, career
      const students = json.map((row) => ({
        studentCode: String(row.studentCode || row.codigo || ""),
        firstName: String(row.firstName || row.nombres || ""),
        lastName: String(row.lastName || row.apellidos || ""),
        email: row.email ? String(row.email) : undefined,
        career: String(row.career || row.carrera || ""),
      })).filter(s => s.studentCode && s.firstName && s.lastName && s.career);
      if (students.length === 0) throw new Error("El archivo no contiene estudiantes válidos");
      await onSubmit(students);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al procesar el archivo");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Cargar Estudiantes por Excel</h2>
        <input
          type="file"
          accept=".xlsx,.xls"
          ref={inputRef}
          onChange={handleFile}
          className="border rounded px-3 py-2"
          disabled={loading}
        />
        <div className="text-xs text-gray-500">El archivo debe tener columnas: studentCode, firstName, lastName, email, career</div>
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
        </div>
      </div>
    </div>
  );
}
