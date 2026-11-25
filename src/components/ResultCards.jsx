import { ChevronDown } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ResultDetails from './ResultDetails'

function meta(result) {
  const fields = result.fields
  if (result.identifierKind === 'cin') {
    return [
      fields.industryCode ? `NIC ${fields.industryCode}` : null,
      fields.registrationNumber ? `ROC ${fields.registrationNumber}` : null,
      fields.stateCode,
    ]
      .filter(Boolean)
      .join(' · ')
  }
  if (result.identifierKind === 'llpin') {
    return `Prefix ${fields.llpinPrefix ?? '—'} · serial ${fields.llpinSerial ?? '—'}`
  }
  return 'No fixed structure'
}

export default function ResultCards({ results, expandedIds, onToggle, onCopy, onOpenGuide }) {
  return (
    <ul className="space-y-2.5">
      {results.map((result) => {
        const expanded = expandedIds.has(result.id)
        const identifier = result.normalized || result.original.trim() || '∅'

        return (
          <li
            key={result.id}
            className={`overflow-hidden rounded-xl border bg-white transition ${
              expanded ? 'border-line-strong' : 'border-line'
            }`}
          >
            <button
              type="button"
              onClick={() => onToggle(result.id)}
              aria-expanded={expanded}
              aria-controls={`result-details-${result.id}`}
              className="w-full px-4 py-3.5 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-ink-500">
                    {String(result.lineNumber).padStart(2, '0')}
                  </span>
                  <StatusBadge status={result.status} />
                </div>
                <ChevronDown
                  size={15}
                  strokeWidth={2}
                  className={`shrink-0 text-ink-500 transition-transform duration-150 ${
                    expanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="mono-id break-all text-[13.5px] text-ink-950">{identifier}</span>
                {result.isDuplicate ? (
                  <span className="chip border-caution-100 bg-caution-50 text-caution-700">
                    ×{result.occurrences}
                  </span>
                ) : null}
                {result.normalization.changed ? (
                  <span className="chip border-line bg-paper text-ink-500">norm.</span>
                ) : null}
              </div>

              <p className="mt-1.5 text-[11.5px] font-semibold leading-[1.45] text-ink-700">
                {result.identifierKind === 'unknown' ? 'No decodable blocks' : result.summary}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink-500">
                  {meta(result)}
                </span>
                <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-ink-500">
                  Format only
                </span>
              </div>
            </button>

            {expanded ? (
              <ResultDetails result={result} onCopy={onCopy} onOpenGuide={onOpenGuide} />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
