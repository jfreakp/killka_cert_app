interface Props {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, total, onPageChange }: Props) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-on-surface-variant">
        {total} certificado{total !== 1 ? "s" : ""} • Página {page} de {pages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 transition-all"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 transition-all"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
