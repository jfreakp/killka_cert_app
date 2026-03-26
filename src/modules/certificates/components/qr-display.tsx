"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  certificateId: string;
  serialNumber: string;
}

export function QrDisplay({ certificateId, serialNumber }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const qrUrl = `/api/certificates/${certificateId}/qr`;

  function handleDownload() {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `QR_${serialNumber}.png`;
    link.click();
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 text-center">
      <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
        Código QR de verificación
      </h3>
      <div className="relative w-[200px] h-[200px] mx-auto mb-4 rounded-xl overflow-hidden bg-white flex items-center justify-center">
        {!error ? (
          <Image
            src={qrUrl}
            alt={`QR de verificación - ${serialNumber}`}
            width={200}
            height={200}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px]">qr_code_2</span>
            <span className="text-xs">Error al generar QR</span>
          </div>
        )}
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-primary text-[32px]">
              progress_activity
            </span>
          </div>
        )}
      </div>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary-container/30 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">download</span>
        Descargar QR
      </button>
    </div>
  );
}
