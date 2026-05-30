import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListRowProps {
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  className?: string
}

export function ListRow({ title, subtitle, leading, trailing, onClick, className }: ListRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border border-border-1 bg-surface px-3.5 py-3 text-left transition-colors hover:bg-sunken active:scale-[0.99]',
        className,
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <div className="truncate font-body text-[15px] font-semibold text-fg-1">{title}</div>
        {subtitle && <div className="truncate font-body text-sm text-fg-3">{subtitle}</div>}
      </div>
      {trailing}
      <ChevronRight size={20} className="shrink-0 text-fg-4" />
    </button>
  )
}
