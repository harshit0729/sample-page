import { STATUS } from '../utils/constants'

const STYLES = {
  [STATUS.valid]: {
    label: 'Valid format',
    className: 'border-valid-100 bg-valid-50 text-valid-700',
    dot: 'bg-valid-600',
  },
  [STATUS.warning]: {
    label: 'Review notes',
    className: 'border-caution-100 bg-caution-50 text-caution-700',
    dot: 'bg-caution-600',
  },
  [STATUS.invalid]: {
    label: 'Invalid',
    className: 'border-invalid-100 bg-invalid-50 text-invalid-700',
    dot: 'bg-invalid-600',
  },
}

export default function StatusBadge({ status, className = '' }) {
  const style = STYLES[status] ?? STYLES[STATUS.invalid]

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${style.className} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  )
}
