import { Minus, Plus } from 'lucide-react'

interface StepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}

// Fiel a design-system/preview/comp-avaliacao.html (.ctrl/.rnd/.val):
// container pill cinza (gray-50), padding 4px, gap 14px; AMBOS botões redondos 40px brancos,
// ícone verde (green-600) + shadow-sm; valor central Archivo 900 24px.
export function Stepper({ value, onChange, min = 0, max = 99 }: StepperProps) {
  return (
    <div className="inline-flex items-center bg-gray-50" style={{ gap: 14, borderRadius: 999, padding: 4 }}>
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex items-center justify-center rounded-full bg-gray-0 text-green-600 shadow-sm active:scale-90 disabled:text-fg-4 disabled:shadow-none"
        style={{ width: 40, height: 40 }}
        aria-label="Diminuir"
      >
        <Minus size={20} />
      </button>
      <span className="text-center font-num font-black tabular-nums text-fg-1" style={{ width: 24, fontSize: 24 }}>
        {value}
      </span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex items-center justify-center rounded-full bg-gray-0 text-green-600 shadow-sm active:scale-90 disabled:text-fg-4 disabled:shadow-none"
        style={{ width: 40, height: 40 }}
        aria-label="Aumentar"
      >
        <Plus size={20} />
      </button>
    </div>
  )
}
