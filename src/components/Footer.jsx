import { Lock } from 'lucide-react'
import Logo from './Logo'

const LINKS = [
  { href: '#workbench', label: 'Workbench' },
  { href: '#register', label: 'Register' },
  { href: '#method', label: 'Method' },
]

export default function Footer({ onOpenGuide }) {
  return (
    <div className="bg-ink-950 text-white">
      <div className="container-page grid gap-6 py-12 sm:grid-cols-[0.7fr_1.3fr] sm:gap-10 lg:py-16">
        <p className="font-mono text-[8.5px] font-medium uppercase tracking-[0.18em] text-white/35">
          The line we draw
        </p>
        <blockquote className="max-w-3xl font-serif text-[clamp(1.7rem,3.6vw,2.65rem)] leading-[1.15] tracking-[-0.015em]">
          A CIN can tell you where a company was registered.{' '}
          <span className="text-white/40">
            Only the register can tell you whether it still exists.
          </span>
        </blockquote>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-6 py-7 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <a href="#top" className="flex items-center gap-2.5" aria-label="FileSure home">
              <Logo className="h-8 w-8" tone="light" />
              <span className="text-[14px] font-extrabold tracking-[-0.02em] text-white">
                FileSure
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/35">
                CIN &amp; LLPIN Checker
              </span>
            </a>
            <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-white/40">
              <Lock size={10} strokeWidth={2} aria-hidden="true" />
              No uploads. No identifiers stored. Checks run in your browser.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-10">
            <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[11px] font-semibold text-white/55 transition hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={onOpenGuide}
                className="text-[11px] font-semibold text-white/55 transition hover:text-white"
              >
                Field guide
              </button>
            </nav>
            <p className="max-w-[15rem] text-[9.5px] leading-[1.6] text-white/30">
              Independent structural checker. Not affiliated with the Ministry of Corporate
              Affairs. © 2026 FileSure.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
