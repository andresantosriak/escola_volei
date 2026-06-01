import { Calendar, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMatchCardDate } from '@/lib/format'
import type { MatchListItem } from '@/services/match-service'

// Fiel a design-system/preview/comp-resultado.html:
// card branco radius 16 shadow-md SEM borda; data uppercase; cada time em COLUNA
// (nome Archivo 800 18px + elenco 11px cinza); placar Archivo 900 34px; vencedor win-700.
function rosterLabel(names: string[] = []): string {
  if (names.length === 0) return ''
  const shown = names.slice(0, 3).join(', ')
  const extra = names.length > 3 ? ` +${names.length - 3}` : ''
  return shown + extra
}

export function ResultCard({ match, onClick }: { match: MatchListItem; onClick?: () => void }) {
  const aWin = match.winner === 'a'
  const bWin = match.winner === 'b'
  return (
    <button
      onClick={onClick}
      className="w-full bg-surface text-left transition-transform active:scale-[0.99]"
      style={{ borderRadius: 16, boxShadow: 'var(--shadow-md)', padding: '16px 18px' }}
    >
      <div
        className="flex items-center font-semibold uppercase text-fg-3"
        style={{ gap: 6, marginBottom: 12, fontSize: 11, letterSpacing: '0.04em' }}
      >
        <Calendar size={14} />
        {formatMatchCardDate(match.match_date)}
        {match.walkover && (
          <span
            className="ml-auto rounded font-bold text-warn-700"
            style={{ background: 'var(--color-warn-bg)', padding: '2px 6px', fontSize: 10 }}
          >
            W.O.
          </span>
        )}
      </div>

      <div className="flex items-center justify-between" style={{ gap: 10 }}>
        {/* Time A (coluna) */}
        <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 4 }}>
          <span
            className={cn(
              'flex items-center gap-1.5 truncate font-display font-extrabold',
              aWin ? 'text-win-700' : 'text-fg-1',
            )}
            style={{ fontSize: 18 }}
          >
            {aWin && <Trophy size={18} className="shrink-0 text-yellow-500" />}
            {match.team_a_name}
          </span>
          {match.roster_a && match.roster_a.length > 0 && (
            <span className="truncate text-fg-3" style={{ fontSize: 11 }}>
              {rosterLabel(match.roster_a)}
            </span>
          )}
        </div>

        {/* Placar */}
        <span
          className="flex shrink-0 items-center font-num font-black tabular-nums"
          style={{ gap: 10, fontSize: 34, letterSpacing: '-0.02em' }}
        >
          <span className={aWin ? 'text-win-700' : 'text-fg-1'}>{match.sets_a}</span>
          <span className="font-body font-semibold text-fg-4" style={{ fontSize: 18 }}>
            ×
          </span>
          <span className={bWin ? 'text-win-700' : 'text-fg-1'}>{match.sets_b}</span>
        </span>

        {/* Time B (coluna, à direita) */}
        <div className="flex min-w-0 flex-1 flex-col items-end text-right" style={{ gap: 4 }}>
          <span
            className={cn(
              'flex items-center gap-1.5 truncate font-display font-extrabold',
              bWin ? 'text-win-700' : 'text-fg-1',
            )}
            style={{ fontSize: 18 }}
          >
            {bWin && <Trophy size={18} className="shrink-0 text-yellow-500" />}
            {match.team_b_name}
          </span>
          {match.roster_b && match.roster_b.length > 0 && (
            <span className="truncate text-fg-3" style={{ fontSize: 11 }}>
              {rosterLabel(match.roster_b)}
            </span>
          )}
        </div>
      </div>

      {match.set_summary && (
        <p className="text-center text-fg-3" style={{ fontSize: 11, marginTop: 10 }}>
          {match.set_summary}
        </p>
      )}
    </button>
  )
}
