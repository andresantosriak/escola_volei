import { POSITIONS, POSITION_KEYS, type PositionKey } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

interface PositionFieldProps {
  principal: PositionKey | ''
  alternates: PositionKey[]
  onPrincipalChange: (p: PositionKey) => void
  onAlternatesChange: (a: PositionKey[]) => void
}

export function PositionField({
  principal,
  alternates,
  onPrincipalChange,
  onAlternatesChange,
}: PositionFieldProps) {
  const toggleAlt = (k: PositionKey) =>
    onAlternatesChange(alternates.includes(k) ? alternates.filter((x) => x !== k) : [...alternates, k])

  return (
    <div className="mb-4">
      <Label>Posição principal</Label>
      <div className="grid grid-cols-2 gap-2">
        {POSITION_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              onPrincipalChange(k)
              onAlternatesChange(alternates.filter((x) => x !== k))
            }}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-2.5 text-left font-body text-sm transition-colors',
              principal === k
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-border-1 bg-surface text-fg-2',
            )}
          >
            <b className="font-display">{k}</b>
            <span className="truncate text-xs text-fg-3">{POSITIONS[k]}</span>
          </button>
        ))}
      </div>

      <Label className="mt-4">Também joga como · opcional</Label>
      <div className="grid grid-cols-2 gap-2">
        {POSITION_KEYS.filter((k) => k !== principal).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => toggleAlt(k)}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-2.5 text-left font-body text-sm transition-colors',
              alternates.includes(k)
                ? 'border-ink-600 bg-[#E6ECFB] text-ink-700'
                : 'border-border-1 bg-surface text-fg-2',
            )}
          >
            <b className="font-display">{k}</b>
            <span className="truncate text-xs text-fg-3">{POSITIONS[k]}</span>
          </button>
        ))}
      </div>
      <p className="mt-2.5 px-0.5 text-[11px] leading-relaxed text-fg-4">
        A principal vira a <b>tag</b> no card e nos times, e ajuda o balanceador a não deixar um time
        sem levantador. <i>Não confundir com o fundamento "Levantamento".</i>
      </p>
    </div>
  )
}
