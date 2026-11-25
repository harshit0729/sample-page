import { useMemo, useState } from 'react'
import { validateIdentifier } from '../utils/validateIdentifier'
import { displayOrDash } from '../utils/validationUtils'

const SHORT_LABELS = {
  listing: 'Listing',
  industry: 'Industry',
  state: 'State',
  year: 'Incorporated',
  category: 'Category',
  registration: 'ROC serial',
  prefix: 'Prefix',
  separator: 'Hyphen',
  serial: 'Serial',
}

const SPECIMENS = [
  { id: 'cin', tab: 'Company CIN', code: 'U72200KA2015PTC082236' },
  { id: 'nidhi', tab: 'Nidhi CIN', code: 'U65929MH2020PLN350399' },
  { id: 'llpin', tab: 'LLPIN', code: 'AAB-4321' },
].map((specimen) => ({ ...specimen, result: validateIdentifier(specimen.code) }))

function blockValue(segment) {
  return segment.value || '—'
}

export default function AnatomyCard() {
  const [activeId, setActiveId] = useState('cin')
  const [hovered, setHovered] = useState(null)

  const active = SPECIMENS.find((specimen) => specimen.id === activeId) ?? SPECIMENS[0]
  const { result } = active

  const summaryLine = useMemo(() => {
    if (result.identifierKind === 'llpin') {
      return 'Three letters, a hyphen and four digits. That is the whole identifier.'
    }
    return result.summary
  }, [result])

  return (
    <div className="relative">
      <div
        className="absolute -right-2.5 top-4 hidden h-[calc(100%+10px)] w-full rounded-2xl border border-line-strong bg-paper-warm/70 sm:block"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-950 p-5 shadow-lift sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-white/40">
              The anatomy
            </p>
            <h2 className="mt-1 text-[13.5px] font-bold text-white">What is inside the string</h2>
          </div>
          <span className="stamp">Format only</span>
        </div>

        <div
          className="mt-5 inline-flex flex-wrap items-center gap-0.5 rounded-full border border-white/10 p-0.5"
          role="group"
          aria-label="Choose a specimen"
        >
          {SPECIMENS.map((specimen) => {
            const selected = specimen.id === activeId
            return (
              <button
                key={specimen.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setActiveId(specimen.id)
                  setHovered(null)
                }}
                className={`rounded-full px-2.5 py-1 font-mono text-[9.5px] font-medium uppercase tracking-[0.08em] transition ${
                  selected
                    ? 'bg-paper text-ink-950'
                    : 'text-white/50 hover:bg-white/[0.06] hover:text-white/85'
                }`}
              >
                {specimen.tab}
              </button>
            )
          })}
        </div>

        <div
          className="mt-5 flex gap-[3px]"
          aria-label={`Segments of ${active.code}`}
          onMouseLeave={() => setHovered(null)}
        >
          {result.segments.map((segment) => {
            const highlighted = hovered === segment.key
            return (
              <button
                key={segment.key}
                type="button"
                title={`${segment.label}: ${segment.reading}`}
                onMouseEnter={() => setHovered(segment.key)}
                onFocus={() => setHovered(segment.key)}
                onBlur={() => setHovered(null)}
                style={{ flexGrow: Math.max(segment.value.length, 1), flexBasis: 0 }}
                className={`min-w-0 rounded-[3px] px-1 py-2.5 text-center transition sm:px-1.5 ${
                  highlighted
                    ? 'bg-signal-500 text-white'
                    : 'bg-paper text-ink-950 hover:bg-signal-100'
                }`}
              >
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] font-semibold sm:text-[12px]">
                  {blockValue(segment)}
                </span>
                <span
                  className={`mt-1 block font-mono text-[7.5px] uppercase tracking-[0.08em] ${
                    highlighted ? 'text-white/75' : 'text-ink-500'
                  }`}
                >
                  {segment.positions}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {result.segments.map((segment) => (
            <div
              key={segment.key}
              className={`border-t pt-2 transition ${
                hovered === segment.key ? 'border-signal-200/60' : 'border-white/10'
              }`}
              onMouseEnter={() => setHovered(segment.key)}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.13em] text-white/40">
                  {SHORT_LABELS[segment.key] ?? segment.label}
                </span>
                <span className="truncate font-mono text-[10px] text-white/70">
                  {displayOrDash(segment.value)}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-[1.35] text-white/75">{segment.reading}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-start justify-between gap-4 border-t border-white/10 pt-4">
          <p className="max-w-[85%] text-[11.5px] leading-[1.55] text-white/55">{summaryLine}</p>
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">
            Fig. 01
          </span>
        </div>
      </div>
    </div>
  )
}
