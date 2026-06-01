import { cn } from '@/lib/utils'

export type FilterMode = 'all' | 'by_class' | 'by_student' | 'month'

interface FilterChip {
  mode: FilterMode
  label: string
}

const CHIPS: FilterChip[] = [
  { mode: 'all', label: 'Todas' },
  { mode: 'by_class', label: 'Por turma' },
  { mode: 'by_student', label: 'Por aluno' },
  { mode: 'month', label: '' }, // label set dynamically below
]

interface FilterChipsProps {
  active: FilterMode
  onChange: (mode: FilterMode) => void
}

function currentMonthLabel(): string {
  const now = new Date()
  const month = now.toLocaleDateString('pt-BR', { month: 'long' })
  return month.charAt(0).toUpperCase() + month.slice(1)
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  const monthLabel = currentMonthLabel()

  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{ padding: '0 18px 4px', scrollbarWidth: 'none' }}
    >
      {CHIPS.map((chip) => {
        const isActive = active === chip.mode
        const label = chip.mode === 'month' ? monthLabel : chip.label
        return (
          <button
            key={chip.mode}
            type="button"
            onClick={() => onChange(chip.mode)}
            className={cn(
              'shrink-0 whitespace-nowrap font-body font-bold',
              isActive
                ? 'text-white'
                : 'text-fg-2',
            )}
            style={{
              fontSize: 13,
              padding: '7px 14px',
              borderRadius: 999,
              background: isActive ? 'var(--color-green-500)' : 'var(--surface)',
              boxShadow: isActive ? 'none' : 'var(--shadow-sm)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
