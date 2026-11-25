import { Fragment } from 'react'
import { ChevronDown } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ResultDetails from './ResultDetails'

function secondaryLine(result) {
  if (result.identifierKind === 'cin') {
    return [result.fields.industryCode, result.fields.registrationNumber ? `ROC ${result.fields.registrationNumber}` : null]
      .filter(Boolean)
      .join(' · ')
  }
  if (result.identifierKind === 'llpin') {
    return 'No state, year or class encoded'
  }
  return 'Not a recognised CIN or LLPIN shape'
}

export default function ResultsTable({ results, expandedIds, onToggle, onCopy, onOpenGuide }) {
  return (
    <div className="overflow-x-auto scroll-slim">
      <table className="w-full border-collapse text-left">
          <caption className="sr-only">Validated CINs and LLPINs, one row per pasted line</caption>
          <thead>
            <tr className="border-b border-line bg-paper-warm">
              <th scope="col" className="w-12 px-3 py-2.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.13em] text-ink-500">
                Line
              </th>
              <th scope="col" className="min-w-[13rem] px-3 py-2.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.13em] text-ink-500">
                Identifier
              </th>
              <th scope="col" className="w-20 px-3 py-2.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.13em] text-ink-500">
                Type
              </th>
              <th scope="col" className="px-3 py-2.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.13em] text-ink-500">
                Decoded fields
              </th>
              <th scope="col" className="w-[7.5rem] px-3 py-2.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.13em] text-ink-500">
                Status
              </th>
              <th scope="col" className="w-11 px-2 py-2.5">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const expanded = expandedIds.has(result.id)
              const identifier = result.normalized || result.original.trim() || '∅'
              return (
                <Fragment key={result.id}>
                  <tr
                    className={`border-b border-line transition-colors ${
                      expanded ? 'bg-paper-warm/80' : 'hover:bg-paper-warm/55'
                    }`}
                  >
                    <td className="px-3 py-3 align-top">
                      <span className="font-mono text-[9.5px] text-ink-500">
                        {String(result.lineNumber).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="mono-id break-all text-ink-950">{identifier}</span>
                        {result.isDuplicate ? (
                          <span
                            className="chip border-caution-100 bg-caution-50 text-caution-700"
                            title={`Repeated on lines ${result.duplicateLineNumbers.join(', ')}`}
                          >
                            ×{result.occurrences}
                          </span>
                        ) : null}
                        {result.normalization.changed ? (
                          <span
                            className="chip border-line bg-paper text-ink-500"
                            title="Input was trimmed or upper-cased before checking"
                          >
                            norm.
                          </span>
                        ) : null}
                      </div>
                      {result.normalization.changed ? (
                        <p className="mt-1 truncate font-mono text-[9px] text-ink-500" title={result.original}>
                          as pasted: {result.original.trim() || '∅'}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span className="font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-ink-600">
                        {result.type === 'UNKNOWN' ? 'Unknown' : result.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="text-[12px] font-semibold leading-[1.4] text-ink-800">
                        {result.identifierKind === 'unknown'
                          ? 'No decodable blocks'
                          : result.summary}
                      </p>
                      <p className="mt-0.5 font-mono text-[9px] text-ink-500">{secondaryLine(result)}</p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <StatusBadge status={result.status} />
                    </td>
                    <td className="px-2 py-3 align-top">
                      <button
                        type="button"
                        onClick={() => onToggle(result.id)}
                        aria-expanded={expanded}
                        aria-controls={`result-details-${result.id}`}
                        aria-label={`${expanded ? 'Hide' : 'Show'} details for ${identifier}`}
                        className="icon-button h-7 w-7 border-transparent bg-transparent"
                      >
                        <ChevronDown
                          size={15}
                          strokeWidth={2}
                          className={`transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr className="border-b border-line">
                      <td colSpan={6} className="p-0">
                        <ResultDetails result={result} onCopy={onCopy} onOpenGuide={onOpenGuide} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
    </div>
  )
}
