import { ArrowUpRight, BookOpen, TriangleAlert } from 'lucide-react'
import SectionHeading from './SectionHeading'

const PRINCIPLES = [
  {
    number: '01',
    title: 'Structure first',
    copy: 'Extraction, per-block checks and the aggregate status are separate steps. A 20-character CIN still gets a full six-block trace, so the error points at the missing character instead of returning a generic rejection.',
  },
  {
    number: '02',
    title: 'Codes with provenance',
    copy: 'State and category lists live in separate data files with confidence flags. Where published sources disagree, the checker follows MCA/MoSPI language and records the conflict in the row notes rather than hiding it.',
  },
  {
    number: '03',
    title: 'Bounded by design',
    copy: 'No upload, no API, no lookup. The browser receives a string, applies fixed rules, and returns a trace. That keeps the tool quick and keeps sensitive identifiers out of a third-party service.',
  },
]

const LIMITS = [
  'A well-formed CIN can still belong to a struck-off company, or to no company at all.',
  'Industry codes are shown as digits. NIC sector names vary by vintage and are not asserted.',
  'LLPINs carry no state, year, class or check digit — the decode is intentionally short.',
  'Code lists are snapshots. MCA adds and migrates codes, so unknown values are flagged rather than guessed.',
  'FCRN, FLLPIN, DIN and GSTIN are different identifiers and remain outside this checker.',
]

export default function MethodSection({ onOpenGuide }) {
  return (
    <section id="method" className="border-t border-line bg-paper-deep/55">
      <div className="container-page py-12 lg:py-16">
        <SectionHeading
          number="03"
          title="Method & limits"
          description="The useful part of a checker is not the green tick. It is knowing exactly what the tick covers."
          aside="Format only · no MCA lookup"
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:gap-12">
          <div className="space-y-6">
            {PRINCIPLES.map((principle) => (
              <div key={principle.number} className="border-t border-line-strong pt-3.5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[9px] tracking-[0.14em] text-ink-500">
                    {principle.number}
                  </span>
                  <h3 className="font-serif text-[1.45rem] leading-tight text-ink-950">
                    {principle.title}
                  </h3>
                </div>
                <p className="mt-1.5 max-w-xl pl-7 text-[12px] leading-[1.7] text-ink-600">
                  {principle.copy}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-caution-100 bg-caution-50 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-caution-100 bg-white text-caution-700">
                <TriangleAlert size={13} strokeWidth={2} aria-hidden="true" />
              </span>
              <p className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.15em] text-caution-700">
                Known limits
              </p>
            </div>

            <ul className="mt-4 space-y-2.5">
              {LIMITS.map((limit) => (
                <li key={limit} className="flex gap-2.5 text-[11.5px] leading-[1.6] text-[#6b4c12]">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-caution-600/70" aria-hidden="true" />
                  <span>{limit}</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 border-t border-caution-100 pt-3.5 font-serif text-[1.15rem] italic leading-snug text-caution-700">
              Format is not a fact. The register is the record.
            </p>

            <button
              type="button"
              onClick={onOpenGuide}
              className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-caution-700 underline decoration-caution-600/30 underline-offset-4 transition hover:decoration-caution-600"
            >
              <BookOpen size={12} strokeWidth={2} aria-hidden="true" />
              Open the format reference
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 border-t border-line pt-5 sm:grid-cols-[0.9fr_1.1fr] sm:gap-8">
          <div>
            <p className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.15em] text-ink-500">
              Primary references
            </p>
            <p className="mt-1.5 text-[10.5px] leading-[1.65] text-ink-500">
              MCA CIN structure and company-category FAQ material (2024–2026); MoSPI Annual
              Survey of Industries CIN instructions; Companies Act, 2013 and LLP Act, 2008 for
              identifier context; observed MCA CINs for legacy state codes and PLN.
            </p>
          </div>
          <div className="flex flex-wrap items-start justify-start gap-x-5 gap-y-2 sm:justify-end">
            <button type="button" onClick={onOpenGuide} className="btn-secondary">
              <BookOpen size={13} strokeWidth={2} aria-hidden="true" />
              Field guide
            </button>
            <a
              href="https://www.mca.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              MCA register
              <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
