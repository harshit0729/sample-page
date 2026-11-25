import { useEffect, useRef } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { COMPANY_TYPES, COMPANY_TYPE_CODES } from '../data/companyTypes'
import { STATE_CODE_ALIASES, STATE_CODE_LIST } from '../data/stateCodes'

const CIN_ROWS = [
  ['1', 'Listing status', 'L = listed, U = unlisted.'],
  ['2–6', 'Industry code', 'Five-digit NIC sub-class. The sector name is not resolved.'],
  ['7–8', 'State / jurisdiction', 'MCA code for the registered office, e.g. KA, MH, CT, LH.'],
  ['9–12', 'Year of incorporation', 'Four digits, from 1850 to the current year.'],
  ['13–15', 'Company category', 'Ownership or class: PTC, PLC, OPC, GOI and so on.'],
  ['16–21', 'ROC serial', 'Six-digit serial assigned by the registrar.'],
]

const LLPIN_ROWS = [
  ['1–3', 'Series prefix', 'Three letters. It is a series marker, not a state or year code.'],
  ['4', 'Separator', 'A plain hyphen. En and em dashes are rejected.'],
  ['5–8', 'Serial number', 'Four digits. There is no check digit or checksum.'],
]

const STATUS_LEGEND = [
  {
    label: 'Valid format',
    dot: 'bg-valid-600',
    copy: 'Every structural rule passed. The string is well formed; the entity may still be struck off or renamed.',
  },
  {
    label: 'Review notes',
    dot: 'bg-caution-600',
    copy: 'The shape is valid, but a field is unusual — an unknown category, all-zero industry code, or legacy state code.',
  },
  {
    label: 'Invalid',
    dot: 'bg-invalid-600',
    copy: 'At least one structural rule failed. The decode trace still shows whatever could be read, so the error is specific.',
  },
]

function GuideSection({ number, title, children }) {
  return (
    <section className="border-t border-line pt-6">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[9px] tracking-[0.14em] text-ink-500">{number}</span>
        <h3 className="text-[14px] font-extrabold tracking-[-0.01em] text-ink-950">{title}</h3>
      </div>
      <div className="mt-3 sm:pl-[1.9rem]">{children}</div>
    </section>
  )
}

function AnatomyGrid({ rows }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="hidden grid-cols-[3.25rem_8.5rem_1fr] gap-x-3 border-b border-line-strong bg-paper px-3 py-2 sm:grid">
        {['Positions', 'Block', 'Reading'].map((label) => (
          <span
            key={label}
            className="font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-ink-500"
          >
            {label}
          </span>
        ))}
      </div>
      {rows.map(([positions, block, reading]) => (
        <div
          key={positions}
          className="grid grid-cols-[2.6rem_1fr] gap-x-3 gap-y-1 border-b border-line px-3 py-2.5 last:border-b-0 sm:grid-cols-[3.25rem_8.5rem_1fr] sm:items-start"
        >
          <span className="pt-px font-mono text-[9.5px] text-ink-500">{positions}</span>
          <span className="text-[11px] font-bold leading-4 text-ink-800">{block}</span>
          <span className="col-span-2 text-[10.5px] leading-[1.55] text-ink-600 sm:col-span-1">
            {reading}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function FormatGuideModal({ onClose }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-ink-950/55 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        className="mx-auto my-2 w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-paper shadow-lift sm:my-4"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="font-mono text-[8.5px] font-medium uppercase tracking-[0.17em] text-ink-500">
              Field guide · format reference
            </p>
            <h2 id="guide-title" className="mt-1 font-serif text-[1.7rem] leading-tight text-ink-950">
              How to read the string
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close field guide"
            className="icon-button mt-0.5"
          >
            <X size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-7">
          <p className="max-w-2xl text-[12.5px] leading-[1.7] text-ink-600">
            A CIN is a 21-character company identifier. An LLPIN is an 8-character LLP
            identifier. Both are fixed-width, so a reader can split them at known positions —
            but neither carries a proof of existence.
          </p>

          <GuideSection number="01" title="CIN — 21 characters, six blocks">
            <AnatomyGrid rows={CIN_ROWS} />
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 rounded-lg bg-paper-warm px-3 py-2">
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-500">
                Example
              </span>
              <code className="font-mono text-[11.5px] font-medium tracking-[0.02em] text-ink-900">
                U72200KA2015PTC082236
              </code>
              <span className="text-[10.5px] text-ink-500">
                — unlisted, Karnataka, incorporated 2015, private limited.
              </span>
            </div>
          </GuideSection>

          <GuideSection number="02" title="LLPIN — 8 characters, no embedded geography">
            <AnatomyGrid rows={LLPIN_ROWS} />
            <p className="mt-2.5 text-[11.5px] leading-5 text-ink-500">
              Example <code className="font-mono text-ink-800">AAB-4321</code>. Do not read a
              state or year into an LLPIN; that information is not encoded. An LLPIN also has no
              check digit, so a clean format result says nothing about whether the LLP was ever
              registered.
            </p>
          </GuideSection>

          <GuideSection number="03" title="What the three statuses mean">
            <ul className="space-y-2.5">
              {STATUS_LEGEND.map((item) => (
                <li key={item.label} className="flex gap-2.5">
                  <span className={`mt-[6px] h-2 w-2 shrink-0 rounded-full ${item.dot}`} aria-hidden="true" />
                  <p className="text-[11.5px] leading-[1.6] text-ink-600">
                    <span className="font-bold text-ink-800">{item.label}.</span> {item.copy}
                  </p>
                </li>
              ))}
            </ul>
          </GuideSection>

          <GuideSection number="04" title="Category codes we map">
            <ul className="grid gap-x-5 sm:grid-cols-2">
              {COMPANY_TYPE_CODES.map((code) => {
                const type = COMPANY_TYPES[code]
                return (
                  <li
                    key={code}
                    className="flex items-start gap-2 border-b border-line py-1.5 last:border-b-0"
                  >
                    <code className="mt-px inline-block w-9 shrink-0 rounded border border-line bg-white px-1 py-0.5 text-center font-mono text-[9.5px] font-medium text-ink-800">
                      {code}
                    </code>
                    <span className="text-[10.5px] leading-4 text-ink-600">{type.label}</span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2.5 text-[10.5px] leading-[1.55] text-ink-500">
              <span className="font-semibold text-ink-700">Provenance note.</span> PLN is observed
              in MCA CINs but is missing from some older published lists, so it is treated as an
              observed code. FLC and FTC are read as public and private subsidiaries of a foreign
              company, following MCA/MoSPI material — not as “financial leasing”, a description
              that appears in some secondary sources.
            </p>
          </GuideSection>

          <GuideSection number="05" title="State and jurisdiction codes">
            <p className="text-[11.5px] leading-[1.6] text-ink-600">
              The checker accepts codes observed in MCA CINs, including older codes that remain
              in circulation. Legacy is not the same as invalid. ISO abbreviations that MCA does
              not use in CINs are rejected with a suggestion:
            </p>
            <p className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(STATE_CODE_ALIASES).map(([alias, target]) => (
                <span
                  key={alias}
                  className="inline-flex items-center gap-1 rounded border border-line bg-white px-1.5 py-0.5 font-mono text-[9px] text-ink-600"
                >
                  {alias} <span className="text-ink-500">→</span>{' '}
                  <span className="font-semibold text-ink-800">{target.code}</span>
                  <span className="font-sans text-[9px] text-ink-500">{target.name}</span>
                </span>
              ))}
            </p>

            <details className="group mt-3 rounded-lg border border-line bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-[11px] font-semibold text-ink-700 transition hover:bg-paper-warm">
                {STATE_CODE_LIST.length} accepted codes
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-500 group-open:hidden">
                  Show
                </span>
                <span className="hidden font-mono text-[8px] uppercase tracking-[0.12em] text-ink-500 group-open:inline">
                  Hide
                </span>
              </summary>
              <ul className="grid gap-x-4 border-t border-line px-3 py-2 sm:grid-cols-2">
                {STATE_CODE_LIST.map((state) => (
                  <li
                    key={state.code}
                    className="flex items-baseline gap-2 border-b border-line/70 py-1 last:border-b-0"
                  >
                    <span className="w-7 shrink-0 font-mono text-[9.5px] font-semibold text-ink-800">
                      {state.code}
                    </span>
                    <span className="text-[10.5px] leading-4 text-ink-600">{state.name}</span>
                    {state.status === 'legacy' ? (
                      <span className="ml-auto shrink-0 font-mono text-[7.5px] uppercase tracking-[0.08em] text-caution-700">
                        legacy
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </details>
            <p className="mt-2 text-[10.5px] leading-5 text-ink-500">
              Two commonly confused codes: Chhattisgarh is <span className="font-mono">CT</span>{' '}
              (not CG), and Odisha is <span className="font-mono">OR</span> (not OD).
              Uttarakhand is usually <span className="font-mono">UR</span>; older CINs may show{' '}
              <span className="font-mono">UT</span>. Telangana now uses{' '}
              <span className="font-mono">TG</span>; older CINs may show{' '}
              <span className="font-mono">TS</span>. Ladakh is seen as{' '}
              <span className="font-mono">LH</span> in CINs.
            </p>
          </GuideSection>

          <GuideSection number="06" title="Edges this checker handles">
            <ul className="grid gap-x-5 gap-y-1.5 text-[11px] leading-[1.6] text-ink-600 sm:grid-cols-2">
              {[
                'Surrounding spaces and lowercase are normalised, then shown.',
                'En and em dashes in an LLPIN are rejected with a plain-hyphen hint.',
                'Legacy state codes are accepted and annotated.',
                'Repeated lines are kept and marked, so totals reconcile.',
                'Batches over 500 are rejected whole, never silently trimmed.',
                'Unknown three-letter categories warn instead of guessing.',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </GuideSection>

          <GuideSection number="07" title="Deliberately out of scope">
            <p className="text-[11.5px] leading-[1.65] text-ink-600">
              No MCA lookup is made. This tool does not confirm that a company or LLP exists,
              is active, or belongs to the people who sent you the identifier. It does not
              resolve NIC sector names, and it does not handle FCRN, FLLPIN, DIN or GSTIN —
              different identifiers with different rules. For registration status, director
              details, charges and filings, use the MCA register.
            </p>
            <a
              href="https://www.mca.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-signal-700 underline decoration-signal-200 underline-offset-4 hover:decoration-signal-600"
            >
              Check the register at mca.gov.in
              <ExternalLink size={11} strokeWidth={2} aria-hidden="true" />
            </a>
          </GuideSection>

          <p className="border-t border-line pt-4 font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-500">
            Format is not a fact · FileSure checks structure, not registration
          </p>
        </div>
      </div>
    </div>
  )
}
