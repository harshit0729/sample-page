import { ArrowRight, BookOpen, Lock } from 'lucide-react'
import AnatomyCard from './AnatomyCard'

const STATS = [
  { value: '21', label: 'characters', detail: 'a CIN is fixed-length' },
  { value: '500', label: 'identifiers', detail: 'maximum per batch' },
  { value: '0', label: 'uploads', detail: 'runs in your browser' },
]

export default function Hero({ onRunSample, onOpenGuide }) {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div
        className="pointer-events-none absolute inset-0 paper-grid opacity-40"
        style={{
          maskImage: 'linear-gradient(to bottom, black, transparent 82%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 82%)',
        }}
        aria-hidden="true"
      />

      <div className="container-page relative grid items-center gap-12 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-20">
        <div className="animate-rise">
          <div className="flex items-center gap-2.5">
            <span className="h-[7px] w-[7px] rounded-[1px] bg-signal-500" aria-hidden="true" />
            <span className="label-mono text-ink-600">
              Registry desk <span className="text-line-strong">/</span> Identifier workbench
            </span>
          </div>

          <h1 className="mt-5 font-serif text-[clamp(2.85rem,6.4vw,4.75rem)] leading-[0.94] tracking-[-0.025em] text-ink-950">
            Read the shape.
            <br />
            <span className="italic text-signal-600">Then verify the entity.</span>
          </h1>

          <p className="mt-6 max-w-[33rem] text-[14.5px] leading-[1.8] text-ink-600">
            FileSure checks Indian CINs and LLPINs at the character level, decodes every
            embedded block, and is clear about where the paper trail stops. Format is not
            the same as fact.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRunSample}
              className="btn-primary group px-5 py-3 text-[13.5px]"
            >
              Run the sample batch
              <ArrowRight
                size={15}
                strokeWidth={2.2}
                className="transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
            <button type="button" onClick={onOpenGuide} className="btn-secondary px-4 py-3">
              <BookOpen size={14} strokeWidth={2} aria-hidden="true" />
              Read the field guide
            </button>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-ink-500">
            <Lock size={11} strokeWidth={2} aria-hidden="true" />
            Nine mixed identifiers. No upload, no account, nothing to configure.
          </p>

          <dl className="mt-9 grid max-w-[27rem] grid-cols-3 border-t border-line-strong">
            {STATS.map((stat) => (
              <div key={stat.label} className="border-r border-line py-4 pr-3 last:border-r-0 last:pr-0 sm:pr-4">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="font-serif text-[2rem] leading-none text-ink-950">{stat.value}</span>
                  <span className="mt-1.5 block font-mono text-[8.5px] font-medium uppercase tracking-[0.13em] text-ink-600">
                    {stat.label}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] leading-4 text-ink-500">{stat.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-rise [animation-delay:90ms]">
          <AnatomyCard />
        </div>
      </div>
    </section>
  )
}
