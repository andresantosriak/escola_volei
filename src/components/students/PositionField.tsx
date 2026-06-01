import { POSITIONS, POSITION_KEYS, type PositionKey } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PositionFieldProps {
  principal: PositionKey | ''
  alternates: PositionKey[]
  onPrincipalChange: (p: PositionKey) => void
  onAlternatesChange: (a: PositionKey[]) => void
}

/* Badge abbreviation inside a pill chip */
function PositionChip({
  abbr,
  name,
  selected,
  variant,
  onClick,
}: {
  abbr: string
  name: string
  selected: boolean
  variant: 'principal' | 'alternate'
  onClick: () => void
}) {
  const isPrincipal = variant === 'principal'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-[6px] rounded-full px-[10px] py-[7px] font-body text-[13px] font-medium transition-colors',
        /* principal selected: solid green bg, white text */
        isPrincipal && selected && 'bg-green-500 text-white',
        /* principal unselected: surface with subtle border */
        isPrincipal && !selected && 'border border-border-2 bg-surface text-fg-2',
        /* alternate selected: green outline/border, surface bg */
        !isPrincipal && selected && 'border border-green-500 bg-surface text-fg-1',
        /* alternate unselected: surface with subtle border */
        !isPrincipal && !selected && 'border border-border-2 bg-surface text-fg-2',
      )}
    >
      {/* abbreviation badge */}
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full px-[7px] py-[2px] font-display text-[11px] font-bold leading-none',
          isPrincipal && selected && 'bg-white/25 text-white',
          isPrincipal && !selected && 'border border-green-500 text-green-600',
          !isPrincipal && selected && 'bg-green-500 text-white',
          !isPrincipal && !selected && 'border border-border-3 text-fg-3',
        )}
      >
        {abbr}
      </span>
      <span className="whitespace-nowrap">{name}</span>
    </button>
  )
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
      <span className="q-label mb-2 block">Posição principal</span>
      <div className="flex flex-wrap gap-[8px]">
        {POSITION_KEYS.map((k) => (
          <PositionChip
            key={k}
            abbr={k}
            name={POSITIONS[k]}
            selected={principal === k}
            variant="principal"
            onClick={() => {
              onPrincipalChange(k)
              onAlternatesChange(alternates.filter((x) => x !== k))
            }}
          />
        ))}
      </div>

      <span className="q-label mb-2 mt-4 block">Também joga como · opcional</span>
      <div className="flex flex-wrap gap-[8px]">
        {POSITION_KEYS.filter((k) => k !== principal).map((k) => (
          <PositionChip
            key={k}
            abbr={k}
            name={POSITIONS[k]}
            selected={alternates.includes(k)}
            variant="alternate"
            onClick={() => toggleAlt(k)}
          />
        ))}
      </div>
      <p className="mt-2.5 px-0.5 text-[11px] leading-relaxed text-fg-4">
        A principal vira a <b>tag</b> no card e nos times, e ajuda o balanceador a não deixar um time
        sem levantador. <i>Não confundir com o fundamento &quot;Levantamento&quot;.</i>
      </p>
    </div>
  )
}
