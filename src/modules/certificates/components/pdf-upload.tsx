"use client";

import { useState, useRef } from "react";
import { uploadPdf } from "../hooks";

interface Props {
  certificateId: string;
  currentPdfUrl: string | null;
  onUploaded: () => void;
}

export function PdfUpload({ certificateId, currentPdfUrl, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const json = await uploadPdf(certificateId, file);
      if (!json.ok) {
        setError(json.message || "Error al subir el PDF");
      } else {
        onUploaded();
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6">
      <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
        Documento PDF
      </h3>

      {currentPdfUrl ? (
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary text-[24px]">
            picture_as_pdf
          </span>
          <div className="flex-1">
            <a
              href={currentPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold text-sm hover:underline"
            >
              Ver documento PDF
            </a>
            <p className="text-xs text-on-surface-variant">Documento adjunto al certificado</p>
          </div>
          <a
            href={currentPdfUrl}
            download
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              download
            </span>
          </a>
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant mb-4">No hay PDF adjunto aún.</p>
      )}

      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer text-on-surface">
        <span className="material-symbols-outlined text-[18px]">upload_file</span>
        {uploading ? "Subiendo..." : currentPdfUrl ? "Reemplazar PDF" : "Subir PDF"}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {error && (
        <p className="text-error text-xs mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
