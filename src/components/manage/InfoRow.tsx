import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface InfoRowProps {
  /** Small label text (fg-3) */
  label: string
  /** Value displayed to the right (inline mode) or below (stacked mode) */
  value?: ReactNode
  /** Optional icon on the left — triggers stacked layout (icon + label-above-value) */
  icon?: LucideIcon
  /** Arbitrary children rendered in place of `value` (e.g. toggle, select) */
  children?: ReactNode
}

export function InfoRow({ label, value, icon: Icon, children }: InfoRowProps) {
  // Stacked layout: icon | label-above-value (detail screens: branch, class)
  if (Icon) {
    return (
      <div className="flex items-start gap-3 border-b border-border-1 py-3.5 last:border-0">
        <Icon size={18} className="mt-0.5 shrink-0 text-fg-4" />
        <div className="min-w-0 flex-1">
          <span className="block font-body text-[12px] font-medium text-fg-3">{label}</span>
          <span className="block font-body text-[15px] font-semibold text-fg-1">
            {children ?? value ?? '—'}
          </span>
        </div>
      </div>
    )
  }

  // Inline layout: label left — value/children right (settings, simple info)
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-1 py-3 last:border-0">
      <span className="font-body text-sm text-fg-3">{label}</span>
      {children ?? (
        <span className="text-right font-body text-[15px] font-semibold text-fg-1">
          {value ?? '—'}
        </span>
      )}
    </div>
  )
}
