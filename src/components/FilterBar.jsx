import { Copy, Download, Search, X } from 'lucide-react'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'valid', label: 'Valid' },
  { id: 'warning', label: 'Review' },
  { id: 'invalid', label: 'Invalid' },
]

export default function FilterBar({
  filter,
  onFilterChange,
  counts,
  typeFilter,
  onTypeChange,
  query,
  onQueryChange,
  onExport,
  onCopyAll,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line bg-white px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-paper-deep p-0.5"
          role="group"
          aria-label="Filter by validation status"
        >
          {FILTERS.map((item) => {
            const active = filter === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange(item.id)}
                className={`rounded-[6px] px-2.5 py-1.5 text-[10.5px] font-semibold transition ${
                  active
                    ? 'bg-white text-ink-950 shadow-sm'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {item.label}
                <span
                  className={`ml-1.5 font-mono text-[9px] ${
                    active ? 'text-ink-500' : 'text-ink-500/70'
                  }`}
                >
                  {counts[item.id] ?? 0}
                </span>
              </button>
            )
          })}
        </div>

        <label htmlFor="type-filter" className="sr-only">
          Filter by identifier type
        </label>
        <select
          id="type-filter"
          value={typeFilter}
          onChange={(event) => onTypeChange(event.target.value)}
          className="select-field h-8 py-0 text-[10.5px]"
        >
          <option value="all">All types</option>
          <option value="cin">CIN only</option>
          <option value="llpin">LLPIN only</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[10rem] flex-1 sm:flex-none sm:w-64">
          <Search
            size={13}
            strokeWidth={2}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500"
            aria-hidden="true"
          />
          <label htmlFor="result-search" className="sr-only">
            Search results
          </label>
          <input
            id="result-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search identifier or state"
            className="field h-8 py-0 pl-8 pr-8 text-[11px] [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-500 transition hover:text-ink-900"
            >
              <X size={12} strokeWidth={2.2} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onExport}
          disabled={disabled}
          aria-label="Export results as CSV"
          title="Export results as CSV"
          className="btn-secondary h-8 py-0"
        >
          <Download size={13} strokeWidth={2} aria-hidden="true" />
          <span className="hidden sm:inline">CSV</span>
        </button>
        <button
          type="button"
          onClick={onCopyAll}
          disabled={disabled}
          aria-label="Copy all results"
          title="Copy all results"
          className="btn-secondary h-8 py-0"
        >
          <Copy size={13} strokeWidth={2} aria-hidden="true" />
          <span className="hidden sm:inline">Copy all</span>
        </button>
      </div>
    </div>
  )
}
