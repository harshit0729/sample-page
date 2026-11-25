import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pageCount, start, end, total, onPageChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper-warm px-4 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-500">
        {total === 0 ? '0 rows' : `${start}–${end} of ${total} rows`}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="icon-button h-7 w-7"
        >
          <ChevronLeft size={14} strokeWidth={2} aria-hidden="true" />
        </button>
        <span className="min-w-[4.5rem] text-center font-mono text-[9.5px] text-ink-600">
          {page} / {Math.max(1, pageCount)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="icon-button h-7 w-7"
        >
          <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
