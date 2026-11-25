import { ShieldCheck } from 'lucide-react'

export default function SummaryStrip({ stats }) {
  const cells = [
    {
      label: 'Checked',
      value: stats.total,
      sub: 'pasted lines',
      tone: 'text-ink-950',
    },
    {
      label: 'Valid format',
      value: stats.validOnly,
      sub: 'structure matches',
      tone: 'text-valid-700',
    },
    {
      label: 'Review notes',
      value: stats.warnings,
      sub: 'valid, with caveats',
      tone: 'text-caution-700',
    },
    {
      label: 'Invalid',
      value: stats.invalid,
      sub: 'structure fails',
      tone: 'text-invalid-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-paper-warm px-4 py-3.5">
          <p className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            {cell.label}
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className={`font-serif text-[2rem] leading-none ${cell.tone}`}>{cell.value}</span>
            <span className="text-[10px] font-medium text-ink-500">
              {cell.value === 1 ? 'line' : 'lines'}
            </span>
          </div>
          <p className="mt-1 text-[10px] leading-4 text-ink-500">{cell.sub}</p>
        </div>
      ))}

      <div className="col-span-2 flex items-start gap-2.5 bg-paper-warm px-4 py-3.5 sm:col-span-2 lg:col-span-1">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-signal-100 bg-signal-50 text-signal-700">
          <ShieldCheck size={14} strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            Scope
          </p>
          <p className="mt-1 text-[12px] font-bold text-ink-900">Format only</p>
          <p className="mt-0.5 text-[10px] leading-4 text-ink-500">
            No MCA records were queried.
          </p>
        </div>
      </div>
    </div>
  )
}
