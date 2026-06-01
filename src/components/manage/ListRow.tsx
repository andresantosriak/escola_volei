import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListRowProps {
  title: string
  subtitle?: string
  /** Convenience: renders a green-50 square with the given icon (green-600). */
  leadingIcon?: LucideIcon
  /** Custom leading element (overrides leadingIcon when both provided). */
  leading?: ReactNode
  /** Custom right-side content (default: ChevronRight). Pass `null` to hide chevron. */
  right?: ReactNode
  /** @deprecated Use `right` instead. Kept for back-compat. */
  trailing?: ReactNode
  onClick?: () => void
  className?: string
}

export function ListRow({
  title,
  subtitle,
  leadingIcon: LeadingIcon,
  leading,
  right,
  trailing,
  onClick,
  className,
}: ListRowProps) {
  const leadingNode = leading ?? (LeadingIcon ? (
    <div className="flex size-[44px] shrink-0 items-center justify-center rounded-[14px] bg-green-50 text-green-600">
      <LeadingIcon size={21} />
    </div>
  ) : null)

  // right takes precedence; if neither right nor trailing, show default chevron
  const rightNode = right !== undefined
    ? right
    : trailing !== undefined
      ? trailing
      : <ChevronRight size={20} className="shrink-0 text-fg-4" />

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-[18px] bg-surface px-4 py-3.5 text-left shadow-sm transition-colors active:bg-sunken active:scale-[0.99]',
        className,
      )}
    >
      {leadingNode}
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[16px] font-extrabold text-fg-1">{title}</div>
        {subtitle && <div className="mt-0.5 truncate font-body text-[12.5px] text-fg-3">{subtitle}</div>}
      </div>
      {rightNode}
    </button>
  )
}
