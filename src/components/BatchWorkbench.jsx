import SectionHeading from './SectionHeading'
import IdentifierInput from './IdentifierInput'
import BatchNotes from './BatchNotes'

export default function BatchWorkbench({
  value,
  onChange,
  onRun,
  onLoadSample,
  onClear,
  stats,
  error,
  textareaRef,
}) {
  return (
    <section id="workbench" className="container-page py-12 lg:py-16">
      <SectionHeading
        number="01"
        title="The workbench"
        description="Paste a column from Excel, a CSV export, or a single line. The checker reads one identifier per line — no delimiter guessing, no silent clean-up."
        aside="Paste → check → read"
      />

      <div className="grid overflow-hidden rounded-2xl border border-line bg-white shadow-panel lg:grid-cols-[0.94fr_1.06fr]">
        <IdentifierInput
          value={value}
          onChange={onChange}
          onRun={onRun}
          onLoadSample={onLoadSample}
          onClear={onClear}
          stats={stats}
          error={error}
          textareaRef={textareaRef}
        />

        <div className="border-t border-line lg:border-l lg:border-t-0">
          <BatchNotes stats={stats} />
        </div>
      </div>

      <p className="mt-3 text-[10.5px] leading-4 text-ink-500">
        Your input is preserved as pasted. Case and whitespace normalisation is shown on each
        result — never applied silently.
      </p>
    </section>
  )
}
