import { ArrowRight, BookOpen, Landmark, SearchX } from 'lucide-react'

const CAPABILITIES = [
  { number: '01', title: 'Decoded', copy: 'State, year, category, listing and ROC serial.' },
  { number: '02', title: 'Checked', copy: 'Every structural rule, with the reasoning shown in full.' },
  { number: '03', title: 'Exportable', copy: 'Clean CSV, or tab-separated text for a quick paste.' },
]

export function EmptyRegister({ onRunSample, onPasteOwn, onOpenGuide }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-line-strong bg-white">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 paper-grid opacity-40"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black)',
        }}
        aria-hidden="true"
      />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-paper text-ink-600">
            <Landmark size={19} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="max-w-xl">
            <p className="font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] text-ink-500">
              Register · no entries
            </p>
            <h3 className="mt-1.5 font-serif text-[1.8rem] leading-tight text-ink-950">
              Nothing on the desk yet.
            </h3>
            <p className="mt-2 text-[12.5px] leading-[1.65] text-ink-600">
              Run the nine-row sample to see a full decode, or paste your own batch above.
              Results appear here and never leave this tab.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={onRunSample} className="btn-primary">
                Run the sample
                <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
              </button>
              <button type="button" onClick={onPasteOwn} className="btn-secondary">
                Paste my own
              </button>
              <button type="button" onClick={onOpenGuide} className="btn-quiet">
                <BookOpen size={12} strokeWidth={2} aria-hidden="true" />
                How to read a CIN
              </button>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
          {CAPABILITIES.map((capability) => (
            <div key={capability.number} className="bg-paper-warm px-4 py-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink-500">
                {capability.number}
              </span>
              <p className="mt-1 text-[11.5px] font-bold text-ink-800">{capability.title}</p>
              <p className="mt-0.5 text-[10.5px] leading-[1.5] text-ink-500">{capability.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function NoMatches({ onClear }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-ink-500">
        <SearchX size={17} strokeWidth={1.9} aria-hidden="true" />
      </span>
      <h3 className="mt-3 font-serif text-[1.5rem] leading-tight text-ink-950">
        No rows match this filter.
      </h3>
      <p className="mt-1.5 max-w-sm text-[11.5px] leading-5 text-ink-500">
        Try a different status, identifier type, or search term. Filters only hide rows; they
        never change the batch.
      </p>
      <button type="button" onClick={onClear} className="btn-secondary mt-4">
        Clear filters
      </button>
    </div>
  )
}
