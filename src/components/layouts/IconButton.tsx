import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconButtonProps {
  /** Lucide icon component */
  icon: LucideIcon
  /** Accessible label (aria-label) */
  label: string
  /** Visual variant: white (solid bg + shadow) or ghost (transparent) */
  variant?: 'white' | 'ghost'
  /** Click handler */
  onClick?: () => void
  /** Extra classes on the outer button */
  className?: string
}

export function IconButton({
  icon: Icon,
  label,
  variant = 'white',
  onClick,
  className,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex shrink-0 items-center justify-center transition-colors active:scale-[0.96]',
        variant === 'white'
          ? 'size-[44px] rounded-[14px] bg-surface shadow-sm text-fg-2'
          : 'size-[40px] rounded-full text-fg-2 hover:bg-sunken',
        className,
      )}
    >
      <Icon size={20} strokeWidth={2} />
    </button>
  )
}
