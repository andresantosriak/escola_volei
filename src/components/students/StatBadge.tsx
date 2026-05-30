import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatBadgeProps {
  value: string | number
  label?: string
  icon?: LucideIcon
  tone?: 'neutral' | 'win' | 'loss' | 'warn' | 'bal'
  className?: string
}

// Fiel a design-system/preview/comp-statbadge.html:
// radius 12px, padding 10px 14px, gap 9px, valor em Archivo 900 20px, label case natural.
const TONES: Record<string, string> = {
  neutral: 'bg-gray-50 text-fg-1 border border-border-1',
  win: 'bg-win-bg text-win-700',
  loss: 'bg-loss-bg text-loss-700',
  warn: 'bg-warn-bg text-warn-700',
  bal: 'bg-bal-bg text-bal-700',
}

export function StatBadge({ value, label, icon: Icon, tone = 'neutral', className }: StatBadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center font-bold', TONES[tone], className)}
      style={{ gap: 9, borderRadius: 12, padding: '10px 14px' }}
    >
      {Icon && <Icon size={18} />}
      <span className="font-num font-black tabular-nums" style={{ fontSize: 20 }}>
        {value}
      </span>
      {label && (
        <span className="font-semibold" style={{ fontSize: 11, opacity: 0.8 }}>
          {label}
        </span>
      )}
    </span>
  )
}
