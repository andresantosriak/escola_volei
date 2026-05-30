import { cn } from '@/lib/utils'

interface Scale5Props {
  value: number
  onChange: (v: number) => void
  max?: number
}

// Fiel a design-system/preview/comp-avaliacao.html (.scale/.s):
// chips 42x42, radius 12px, borda 1.5px, Archivo 800 18px. 2 estados: padrão (branco/fg-3) e ativo (green-500/branco).
export function Scale5({ value, onChange, max = 5 }: Scale5Props) {
  return (
    <div className="flex" style={{ gap: 8 }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const on = value === n
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'flex items-center justify-center font-num font-extrabold transition-colors',
              on ? 'border-green-500 bg-green-500 text-white' : 'border-border-2 bg-gray-0 text-fg-3',
            )}
            style={{ width: 42, height: 42, borderRadius: 12, borderWidth: 1.5, fontSize: 18 }}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}
