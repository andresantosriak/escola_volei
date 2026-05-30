import type { ReactNode } from 'react'

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-1 py-3 last:border-0">
      <span className="font-body text-sm text-fg-3">{label}</span>
      <span className="text-right font-body text-[15px] font-semibold text-fg-1">{value || '—'}</span>
    </div>
  )
}
