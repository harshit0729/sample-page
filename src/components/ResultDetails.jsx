import { AlertTriangle, Check, Copy, Info, ShieldCheck, X } from 'lucide-react'
import { STATUS } from '../utils/constants'
import { displayOrDash } from '../utils/validationUtils'

const CHECK_STYLES = {
  pass: {
    icon: Check,
    wrap: 'border-valid-100 bg-valid-50 text-valid-600',
  },
  warn: {
    icon: AlertTriangle,
    wrap: 'border-caution-100 bg-caution-50 text-caution-600',
  },
  fail: {
    icon: X,
    wrap: 'border-invalid-100 bg-invalid-50 text-invalid-600',
  },
}

function CheckMark({ status, size = 11 }) {
  const style = CHECK_STYLES[status] ?? CHECK_STYLES.fail
  const Icon = style.icon
  return (
    <span
      className={`mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${style.wrap}`}
      aria-hidden="true"
    >
      <Icon size={size} strokeWidth={2.6} />
    </span>
  )
}

function statusLabel(status) {
  if (status === 'pass') return 'Passed'
  if (status === 'warn') return 'Review'
  return 'Failed'
}

export default function ResultDetails({ result, onCopy, onOpenGuide }) {
  const otherDuplicateLines = (result.duplicateLineNumbers ?? []).filter(
    (lineNumber) => lineNumber !== result.lineNumber,
  )

  return (
    <div
      id={`result-details-${result.id}`}
      className="detail-enter border-t border-line bg-paper-warm px-4 py-5 sm:px-6"
      role="region"
      aria-label={`Details for ${result.normalized || 'unrecognised identifier'}`}
    >
      {result.isDuplicate ? (
        <div className="mb-5 flex gap-2 rounded-lg border border-caution-100 bg-caution-50 px-3 py-2 text-[11px] leading-5 text-caution-700">
          <Info size={13} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            Repeated input — occurrence {result.occurrence} of {result.occurrences}
            {otherDuplicateLines.length
              ? `. The same identifier also appears on ${
                  otherDuplicateLines.length === 1 ? 'line' : 'lines'
                } ${otherDuplicateLines.join(', ')}.`
              : '.'}{' '}
            Every occurrence is validated and counted separately.
          </p>
        </div>
      ) : null}

      <div className="grid gap-7 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.16em] text-ink-500">
              Decode trace
            </p>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-ink-500">
              {result.identifierKind === 'llpin' ? '3 blocks' : result.segments.length ? '6 blocks' : 'No blocks'}
            </span>
          </div>

          {result.segments.length ? (
            <div className="mt-2 border-y border-line">
              {result.segments.map((segment) => (
                <div
                  key={segment.key}
                  className="flex items-start gap-2.5 border-b border-line py-2 last:border-b-0 sm:gap-3"
                >
                  <span className="w-7 shrink-0 pt-1 font-mono text-[8.5px] text-ink-500">
                    {segment.positions}
                  </span>
                  <span className="mt-0.5 inline-block min-w-[2.6rem] shrink-0 rounded border border-line-strong bg-white px-1.5 py-0.5 text-center font-mono text-[10.5px] font-medium text-ink-900">
                    {displayOrDash(segment.value)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-bold leading-4 text-ink-800">{segment.label}</p>
                    <p className="text-[10.5px] leading-4 text-ink-500">{segment.reading}</p>
                  </div>
                  <span className="sr-only">{statusLabel(segment.status)}</span>
                  <CheckMark status={segment.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-lg border border-line bg-white px-3 py-3 text-[11.5px] leading-5 text-ink-600">
              No fixed blocks could be extracted. The identifier does not match either family
              closely enough to attempt a decode.
            </p>
          )}

          {result.normalization.changed ? (
            <div className="mt-4 rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink-500">
                Normalised for checking
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <code className="break-all font-mono text-[10.5px] text-ink-500 line-through decoration-line-strong">
                  {result.original.trim() || '∅'}
                </code>
                <span className="text-[10px] text-ink-500">→</span>
                <code className="break-all font-mono text-[10.5px] font-medium text-ink-900">
                  {result.normalized || '∅'}
                </code>
              </div>
              <p className="mt-1 text-[10px] leading-4 text-ink-500">
                {[
                  result.normalization.wasTrimmed ? 'surrounding whitespace trimmed' : null,
                  result.normalization.wasLowercased ? 'lowercase upper-cased' : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'case and spacing normalised'}
                . The original input is retained above.
              </p>
            </div>
          ) : null}

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-500">
                Detected as
              </dt>
              <dd className="mt-0.5 text-[11px] font-semibold text-ink-800">
                {result.type === 'UNKNOWN' ? 'Unrecognised' : result.type}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-500">
                Line
              </dt>
              <dd className="mt-0.5 font-mono text-[11px] text-ink-800">{result.lineNumber}</dd>
            </div>
            <div>
              <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-500">
                Status
              </dt>
              <dd className="mt-0.5 text-[11px] font-semibold text-ink-800">
                {result.status === STATUS.valid
                  ? 'Structure matches'
                  : result.status === STATUS.warning
                    ? 'Review notes'
                    : 'Structure fails'}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          {result.errors.length ? (
            <div className="mb-4 rounded-lg border border-invalid-100 bg-invalid-50 px-3 py-2.5">
              <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-invalid-700">
                {result.errors.length} {result.errors.length === 1 ? 'error' : 'errors'}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {result.errors.map((error) => (
                  <li key={error.code} className="flex gap-2 text-[10.5px] leading-[1.55] text-invalid-700">
                    <X size={11} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.warnings.length ? (
            <div className="mb-4 rounded-lg border border-caution-100 bg-caution-50 px-3 py-2.5">
              <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-caution-700">
                {result.warnings.length} {result.warnings.length === 1 ? 'warning' : 'warnings'}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {result.warnings.map((warning) => (
                  <li
                    key={warning.code}
                    className="flex gap-2 text-[10.5px] leading-[1.55] text-caution-700"
                  >
                    <AlertTriangle
                      size={11}
                      strokeWidth={2.2}
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{warning.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <p className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.16em] text-ink-500">
              Structural checks
            </p>
            <ul className="mt-2 border-y border-line">
              {result.checks.map((check) => (
                <li key={check.id} className="flex gap-2.5 border-b border-line py-1.5 last:border-b-0">
                  <CheckMark status={check.status} size={10} />
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-bold leading-4 text-ink-800">{check.label}</p>
                    <p className="text-[10.5px] leading-[1.45] text-ink-500">{check.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {result.notes.length ? (
            <div className="mt-4">
              <p className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                Caveats &amp; notes
              </p>
              <ul className="mt-2 space-y-1.5">
                {result.notes.map((note) => (
                  <li key={note} className="flex gap-2 text-[10.5px] leading-[1.55] text-ink-500">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <p className="flex items-start gap-1.5 text-[10px] leading-4 text-ink-500">
              <ShieldCheck size={12} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold text-ink-700">Format only.</span> Not checked
                against MCA records.
              </span>
            </p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => onCopy(result)} className="btn-quiet">
                <Copy size={11} strokeWidth={2} aria-hidden="true" />
                Copy record
              </button>
              <button type="button" onClick={onOpenGuide} className="btn-quiet">
                Field guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
