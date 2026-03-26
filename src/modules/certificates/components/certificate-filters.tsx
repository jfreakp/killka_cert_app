"use client";

interface Props {
  status: string;
  search: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
}

const STATUSES = [
  { value: "ALL", label: "Todos" },
  { value: "ISSUED", label: "Emitidos" },
  { value: "DRAFT", label: "Borradores" },
  { value: "REVOKED", label: "Revocados" },
];

export function CertificateFilters({ status, search, onStatusChange, onSearchChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full sm:max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre, código o serial..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Status pills */}
      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => onStatusChange(s.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              status === s.value
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
