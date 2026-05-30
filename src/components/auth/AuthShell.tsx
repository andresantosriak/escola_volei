import type { ReactNode } from 'react'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col justify-center bg-app px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-green-500 shadow-[var(--shadow-cta)]">
          <svg viewBox="0 0 24 24" className="size-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        </div>
        <h1 className="q-h1">{title}</h1>
        {subtitle && <p className="mt-1 font-body text-sm text-fg-3">{subtitle}</p>}
      </div>
      {children}
      {footer && <div className="mt-6 text-center font-body text-sm text-fg-3">{footer}</div>}
    </div>
  )
}
