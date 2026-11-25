import { AlertTriangle, Check, Info } from 'lucide-react'

const ICONS = {
  success: Check,
  error: AlertTriangle,
  info: Info,
}

export default function Toast({ toast }) {
  if (!toast) return null
  const Icon = ICONS[toast.tone] ?? Info

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <div
        key={toast.id}
        role="status"
        aria-live="polite"
        className="animate-toast flex max-w-sm items-center gap-2.5 rounded-lg border border-white/10 bg-ink-950 px-4 py-3 text-[11.5px] font-semibold text-white shadow-lift"
      >
        <span
          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            toast.tone === 'error' ? 'bg-invalid-600 text-white' : 'bg-white/10 text-white'
          }`}
        >
          <Icon size={11} strokeWidth={2.6} aria-hidden="true" />
        </span>
        {toast.message}
      </div>
    </div>
  )
}
