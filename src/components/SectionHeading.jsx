export default function SectionHeading({ number, title, description, aside }) {
  return (
    <div className="mb-5 border-t border-ink-900/15 pt-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-3 sm:gap-4">
          <span className="font-mono text-[10px] font-medium tracking-[0.16em] text-ink-500">
            {number}
          </span>
          <h2 className="font-serif text-[2rem] leading-none tracking-[-0.02em] text-ink-950 sm:text-[2.35rem]">
            {title}
          </h2>
        </div>
        {aside ? (
          <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-500">
            {aside}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-3 max-w-2xl text-[12.5px] leading-5 text-ink-600 sm:pl-[2.1rem]">
          {description}
        </p>
      ) : null}
    </div>
  )
}
