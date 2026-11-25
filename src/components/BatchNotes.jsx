import { Info } from 'lucide-react'
import { MAX_IDENTIFIERS } from '../utils/constants'

const RULES = [
  'One identifier per line. Blank lines and surrounding spaces are ignored.',
  `${MAX_IDENTIFIERS} is a hard ceiling. An over-limit batch is rejected, never trimmed.`,
  'Repeated lines are kept and marked, so totals match what you pasted.',
]

export default function BatchNotes({ stats }) {
  const empty = stats.identifiers === 0
  const overLimit = stats.identifiers > MAX_IDENTIFIERS
  const fillPercent = Math.min(100, (stats.identifiers / MAX_IDENTIFIERS) * 100)

  return (
    <div className="flex h-full flex-col bg-paper-warm p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-ink-500">
            Live readout
          </p>
          <h3 className="mt-1 text-[14px] font-bold text-ink-950">Batch notes</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.13em] text-ink-500">
          <span
            className={`h-1.5 w-1.5 rounded-full ${empty ? 'bg-line-strong' : 'bg-valid-600'}`}
            aria-hidden="true"
          />
          {empty ? 'Waiting' : 'Tallying'}
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4 border-b border-line pb-3">
        <div className="flex items-baseline gap-2">
          <span
            className={`font-serif text-[3.4rem] leading-none ${
              overLimit ? 'text-invalid-600' : 'text-ink-950'
            }`}
          >
            {stats.identifiers}
          </span>
          <span className="pb-1 text-[11.5px] font-medium text-ink-500">
            {stats.identifiers === 1 ? 'identifier' : 'identifiers'}
          </span>
        </div>
        <span className="pb-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-500">
          of {MAX_IDENTIFIERS}
        </span>
      </div>

      <div
        className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-paper-deep"
        role="progressbar"
        aria-label="Batch capacity used"
        aria-valuemin={0}
        aria-valuemax={MAX_IDENTIFIERS}
        aria-valuenow={Math.min(stats.identifiers, MAX_IDENTIFIERS)}
      >
        <div
          className={`h-full transition-[width] duration-200 ${
            overLimit ? 'bg-invalid-600' : 'bg-signal-500'
          }`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'CIN', value: stats.cinCount },
          { label: 'LLPIN', value: stats.llpCount },
          { label: 'Repeats', value: stats.duplicates, caution: stats.duplicates > 0 },
          { label: 'Unique', value: stats.unique },
        ].map((item) => (
          <div key={item.label} className="border-t border-line pt-2">
            <dt className="font-mono text-[8.5px] uppercase tracking-[0.13em] text-ink-500">
              {item.label}
            </dt>
            <dd
              className={`mt-0.5 font-mono text-[15px] font-medium tabular ${
                item.caution ? 'text-caution-700' : 'text-ink-900'
              }`}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      {stats.unknownCount > 0 ? (
        <div className="mt-4 flex gap-2 rounded-lg border border-caution-100 bg-caution-50 px-3 py-2 text-[11px] leading-5 text-caution-700">
          <Info size={13} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            {stats.unknownCount} {stats.unknownCount === 1 ? 'line does' : 'lines do'} not
            resemble a CIN or LLPIN. {stats.unknownCount === 1 ? 'It' : 'They'} will be marked
            invalid and kept in the results.
          </p>
        </div>
      ) : null}

      <div className="mt-6 border-t border-line pt-4">
        <p className="font-mono text-[8.5px] uppercase tracking-[0.15em] text-ink-500">
          House rules
        </p>
        <ol className="mt-3 space-y-2.5">
          {RULES.map((rule, index) => (
            <li key={rule} className="flex gap-2.5 text-[11.5px] leading-[1.55] text-ink-600">
              <span className="mt-px font-mono text-[9px] text-ink-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-auto flex items-start gap-1.5 pt-6 text-[10.5px] leading-4 text-ink-500">
        <Info size={11} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden="true" />
        Format check only. Nothing is stored, uploaded, or checked against MCA records.
      </p>
    </div>
  )
}
