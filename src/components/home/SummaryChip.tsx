import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryChipProps {
  value: string | number
  label: string
  icon: LucideIcon
  /** When true, chip uses green highlight (e.g. presence %) */
  highlight?: boolean
}

/**
 * Small stat chip for the "Resumo da semana" row.
 * Neutral = white surface + shadow-sm; highlighted = green-50 bg + green-700 text.
 * Matches the mockup StatBadge at Home screen scale.
 */
export function SummaryChip({ value, label, icon: Icon, highlight = false }: SummaryChipProps) {
  return (
    <span
      className={cn(
        'inline-flex flex-1 items-center gap-2 rounded-[12px] px-3 py-2.5 font-bold',
        highlight
          ? 'bg-green-50 text-green-700'
          : 'border border-border-1 bg-surface text-fg-1 shadow-sm',
      )}
    >
      <Icon size={18} className={highlight ? 'text-green-700' : 'text-fg-3'} />
      <span className="font-num text-[18px] font-black tabular-nums">{value}</span>
      <span className="text-[11px] font-semibold opacity-80">{label}</span>
    </span>
  )
}
