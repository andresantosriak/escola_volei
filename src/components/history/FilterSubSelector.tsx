import { cn } from '@/lib/utils'

interface FilterSubSelectorProps {
  options: Array<{ value: string; label: string }>
  selected: string
  onChange: (value: string) => void
}

export function FilterSubSelector({ options, selected, onChange }: FilterSubSelectorProps) {
  if (options.length === 0) return null

  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{ padding: '6px 18px 2px', scrollbarWidth: 'none' }}
    >
      {options.map((opt) => {
        const isActive = selected === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'shrink-0 whitespace-nowrap font-body font-semibold',
              isActive ? 'text-white' : 'text-fg-3',
            )}
            style={{
              fontSize: 12,
              padding: '5px 12px',
              borderRadius: 999,
              background: isActive ? 'var(--color-green-600)' : 'var(--surface-2)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
