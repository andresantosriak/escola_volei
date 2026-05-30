import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  back?: boolean
  right?: ReactNode
}

export function Header({ title, subtitle, onBack, back, right }: HeaderProps) {
  const navigate = useNavigate()
  const showBack = back || onBack
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border-1 bg-surface/95 px-4 py-3 backdrop-blur">
      {showBack && (
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-fg-2 hover:bg-sunken"
          aria-label="Voltar"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="q-h2 truncate">{title}</h1>
        {subtitle && <p className="truncate font-body text-sm text-fg-3">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}
