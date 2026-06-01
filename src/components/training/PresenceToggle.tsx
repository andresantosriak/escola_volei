import { Check, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AttendanceStatus } from '@/lib/constants'

// Fiel a design-system/preview/comp-presenca.html (.seg/.opt):
// container pill branco (gray-0) com borda border-2; TODAS as opções mostram o label sempre;
// a ativa ganha fundo colorido + ícone (presente=win-500, falta=loss-500, atraso=warn-500).
// Compact mode: ativa = pill colorido com ícone + label completo;
//               inativas = botão 40x40 com inicial do label (P/F/A) em text-fg-3.
const OPTIONS: {
  value: AttendanceStatus
  icon: typeof Check
  label: string
  initial: string
  on: string
}[] = [
  { value: 'present', icon: Check, label: 'Presente', initial: 'P', on: 'bg-win-500 text-white' },
  { value: 'absent', icon: X, label: 'Falta', initial: 'F', on: 'bg-loss-500 text-white' },
  { value: 'late', icon: Clock, label: 'Atraso', initial: 'A', on: 'bg-warn-500 text-white' },
]

interface PresenceToggleProps {
  value: AttendanceStatus
  onChange: (v: AttendanceStatus) => void
  /** versão compacta: ativa = pill com ícone+label; inativas = inicial (P/F/A) */
  compact?: boolean
}

export function PresenceToggle({ value, onChange, compact }: PresenceToggleProps) {
  return (
    <div
      className="inline-flex gap-1 rounded-full border border-border-2 bg-gray-0 p-1"
      role="group"
      aria-label="Presença"
    >
      {OPTIONS.map((o) => {
        const Icon = o.icon
        const active = value === o.value
        const showLabel = active || !compact
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            aria-label={o.label}
            className={cn(
              'inline-flex items-center justify-center rounded-full font-display font-bold transition-colors',
              active ? o.on : 'text-fg-3',
            )}
            style={
              showLabel
                ? { gap: 7, padding: '9px 14px', fontSize: 14 }
                : { width: 40, height: 40, fontSize: 14 }
            }
          >
            {active && <Icon size={18} />}
            {showLabel ? (
              <span>{o.label}</span>
            ) : (
              <span className="text-[14px] font-bold text-fg-3">{o.initial}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
