import { BookOpen } from 'lucide-react'
import Logo from './Logo'

const NAV_ITEMS = [
  { href: '#workbench', label: 'Workbench' },
  { href: '#register', label: 'Register' },
  { href: '#method', label: 'Method' },
]

export default function Header({ onOpenGuide }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/90 bg-paper/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="FileSure home">
            <Logo className="h-8 w-8" />
            <span className="text-[15px] font-extrabold tracking-[-0.02em] text-ink-950">
              FileSure
            </span>
          </a>
          <span className="hidden h-4 w-px bg-line-strong sm:block" aria-hidden="true" />
          <span className="hidden truncate font-mono text-[9.5px] font-medium uppercase tracking-[0.15em] text-ink-500 sm:block">
            CIN &amp; LLPIN Checker
          </span>
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Sections">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[12.5px] font-semibold text-ink-600 transition hover:text-ink-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="chip hidden border-line-strong bg-white text-ink-500 lg:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-valid-600" aria-hidden="true" />
            Format only
          </span>
          <button type="button" onClick={onOpenGuide} className="btn-secondary">
            <BookOpen size={14} strokeWidth={2} aria-hidden="true" />
            Field guide
          </button>
        </div>
      </div>
    </header>
  )
}
