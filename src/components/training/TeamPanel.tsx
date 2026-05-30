import { Flame, Anchor } from 'lucide-react'
import { Avatar } from '@/components/students/Avatar'
import { firstName } from '@/lib/format'
import type { EnginePlayer } from '@/engine'

interface TeamPanelProps {
  side: 'A' | 'B'
  name: string
  onRename: (name: string) => void
  team: EnginePlayer[]
  onPlayerTap: (playerId: string) => void
}

export function TeamPanel({ side, name, onRename, team, onPlayerTap }: TeamPanelProps) {
  const avgOverall = team.length
    ? Math.round(team.reduce((a, p) => a + p.overall, 0) / team.length)
    : 0
  const hasLev = team.some((p) => p.position === 'LEV')

  return (
    <div className="flex-1 rounded-lg border border-border-1 bg-surface p-3">
      <div className="mb-2 flex items-center gap-2">
        {side === 'A' ? (
          <Flame size={18} className="text-[#F08C00]" />
        ) : (
          <Anchor size={18} className="text-ink-600" />
        )}
        <input
          value={name}
          onChange={(e) => onRename(e.target.value)}
          spellCheck={false}
          className="w-full bg-transparent font-body text-sm font-bold text-fg-1 outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        {team.map((p) => (
          <button
            key={p.id}
            onClick={() => onPlayerTap(p.id)}
            className="flex items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-sunken active:scale-[0.98]"
          >
            <Avatar name={p.name} size={28} />
            <span className="flex-1 truncate font-body text-sm">{firstName(p.name)}</span>
            {p.position === 'LEV' && (
              <span className="rounded-full bg-yellow-400 px-1.5 py-0.5 text-[9px] font-bold text-ink-900">
                LEV
              </span>
            )}
            <span className="font-stat text-sm font-bold tabular-nums text-fg-2">{p.overall}</span>
          </button>
        ))}
        {team.length === 0 && <p className="py-2 text-center text-xs text-fg-4">Vazio</p>}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border-1 pt-2 text-[11px]">
        <span className="rounded bg-sunken px-1.5 py-0.5 font-semibold text-fg-2">
          Geral <b>{avgOverall}</b>
        </span>
        <span className="rounded bg-sunken px-1.5 py-0.5 font-semibold text-fg-2">
          {team.length} jog.
        </span>
        <span
          className="rounded px-1.5 py-0.5 font-semibold"
          style={hasLev ? { background: 'var(--color-sunken)' } : { color: 'var(--color-loss)' }}
        >
          {hasLev ? 'Lev ✓' : 'Sem lev'}
        </span>
      </div>
    </div>
  )
}
