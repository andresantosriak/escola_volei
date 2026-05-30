import { cn } from '@/lib/utils'

interface TabsProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 rounded-lg bg-sunken p-1', className)}>
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            'flex-1 rounded-md px-3 py-2 font-body text-sm font-semibold transition-colors',
            active === t ? 'bg-surface text-green-600 shadow-sm' : 'text-fg-3',
          )}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

interface SegmentedProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  className?: string
}

export function Segmented({ options, value, onChange, className }: SegmentedProps) {
  return (
    <div className={cn('flex gap-1 rounded-lg bg-sunken p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-md px-3 py-2 font-body text-sm font-semibold transition-colors',
            value === o.value ? 'bg-green-500 text-white shadow-sm' : 'text-fg-3',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
