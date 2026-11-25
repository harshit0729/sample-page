import { AlertTriangle, ArrowRight, ListPlus, X } from 'lucide-react'
import { MAX_IDENTIFIERS, SAMPLE_PLACEHOLDER } from '../utils/constants'

function OverLimitNotice({ count }) {
  const excess = Math.max(0, count - MAX_IDENTIFIERS)
  return (
    <div
      role="alert"
      className="mt-3 flex gap-2.5 rounded-lg border border-invalid-600/50 bg-invalid-600/15 px-3 py-2.5 text-[11.5px] leading-5 text-[#ffd9d4]"
    >
      <AlertTriangle size={14} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-bold">{count} identifiers</span> — the limit is{' '}
        {MAX_IDENTIFIERS} per run. Nothing was processed. Remove at least {excess}{' '}
        {excess === 1 ? 'line' : 'lines'} to continue.
      </p>
    </div>
  )
}

export default function IdentifierInput({
  value,
  onChange,
  onRun,
  onLoadSample,
  onClear,
  stats,
  error,
  textareaRef,
}) {
  const empty = value.trim() === ''
  const overLimit = stats.identifiers > MAX_IDENTIFIERS
  const canRun = !empty && !overLimit

  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      if (canRun) onRun()
    }
  }

  return (
    <div className="flex flex-col bg-ink-950 p-5 text-white sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-white/40">
            Intake
          </p>
          <h3 className="mt-1 text-[14px] font-bold text-white">Paste the batch</h3>
        </div>
        <span
          className={`font-mono text-[10.5px] tabular ${
            overLimit ? 'font-semibold text-[#ffb4ac]' : 'text-white/40'
          }`}
        >
          {stats.identifiers} / {MAX_IDENTIFIERS}
        </span>
      </div>

      <label htmlFor="batch-input" className="sr-only">
        CINs and LLPINs, one per line
      </label>
      <div
        className={`mt-3 overflow-hidden rounded-lg border bg-white/[0.035] transition ${
          overLimit ? 'border-invalid-600/70' : 'border-white/10 focus-within:border-white/25'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/30">
            One identifier per line
          </span>
          <button
            type="button"
            onClick={onClear}
            disabled={empty}
            className="btn-on-dark -mr-1 gap-1 text-[10px]"
          >
            <X size={11} strokeWidth={2.2} aria-hidden="true" />
            Clear
          </button>
        </div>
        <textarea
          id="batch-input"
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={SAMPLE_PLACEHOLDER}
          spellCheck="false"
          autoComplete="off"
          autoCapitalize="characters"
          className="scroll-slim h-[236px] w-full resize-y bg-transparent px-3 py-3 font-mono text-[12.5px] leading-[1.85] text-white placeholder:text-white/25 focus:outline-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-white/10 px-3 py-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-white/35">
            {stats.cinCount} CIN · {stats.llpCount} LLPIN · {stats.unknownCount} unknown
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-white/35">
            {overLimit
              ? `${stats.identifiers - MAX_IDENTIFIERS} over`
              : `${MAX_IDENTIFIERS - stats.identifiers} slots left`}
          </span>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-3 flex gap-2.5 rounded-lg border border-invalid-600/50 bg-invalid-600/15 px-3 py-2.5 text-[11.5px] leading-5 text-[#ffd9d4]"
        >
          <AlertTriangle size={14} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : overLimit ? (
        <OverLimitNotice count={stats.identifiers} />
      ) : null}

      <div className="mt-4 flex flex-wrap items-stretch gap-2">
        <button
          type="button"
          onClick={onRun}
          disabled={!canRun}
          className="btn-primary group min-w-[9.5rem] flex-1 py-2.5"
        >
          Check identifiers
          <ArrowRight
            size={14}
            strokeWidth={2.2}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-[11.5px] font-semibold text-white/70 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
        >
          <ListPlus size={13} strokeWidth={2} aria-hidden="true" />
          Load sample
        </button>
      </div>

      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-white/25">
        Ctrl / ⌘ + Enter to run
      </p>
    </div>
  )
}
