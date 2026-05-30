import { initials, formatHeight } from '@/lib/format'
import { SKILL_ORDER, SKILL_ABBR, POSITIONS, type PositionKey } from '@/lib/constants'

export interface PlayerCardData {
  name: string
  position: string
  overall: number
  age?: number | null
  heightCm?: number | null
  dominantHand?: string
  wins: number
  losses: number
  skills: Record<string, number>
  photoUrl?: string | null
}

// Réplica fiel de design-system/preview/comp-playercard.html (valores exatos).
export function PlayerCard({ player }: { player: PlayerCardData }) {
  const posLabel = POSITIONS[player.position as PositionKey] ?? player.position ?? '—'

  return (
    <div
      className="relative overflow-hidden p-5 text-white"
      style={{
        borderRadius: 28,
        background: 'radial-gradient(120% 90% at 80% 0%, #009C3B 0%, #07204F 48%, #03112E 100%)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* sheen */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,.10), transparent 42%)' }}
      />

      {/* header: rating + position */}
      <div className="relative flex items-start justify-between">
        <div className="flex flex-col items-center" style={{ lineHeight: 0.9 }}>
          <span
            className="font-num font-black text-yellow-400"
            style={{ fontSize: 52, letterSpacing: '-0.03em' }}
          >
            {player.overall}
          </span>
          <span
            className="font-body font-bold"
            style={{ fontSize: 10, letterSpacing: '0.14em', color: 'rgba(255,255,255,.7)' }}
          >
            GERAL
          </span>
        </div>
        <span
          className="self-start font-display font-extrabold uppercase"
          style={{
            background: 'var(--color-yellow-400)',
            color: '#2A1E00',
            fontSize: 12,
            letterSpacing: '0.04em',
            padding: '5px 11px',
            borderRadius: 999,
          }}
        >
          {posLabel}
        </span>
      </div>

      {/* portrait */}
      <div
        className="relative mx-auto flex items-center justify-center font-num font-black text-white"
        style={{
          width: 96,
          height: 96,
          margin: '6px auto 8px',
          borderRadius: '50%',
          fontSize: 38,
          background: 'linear-gradient(160deg, #1BAE57, #006B29)',
          border: '3px solid rgba(255,255,255,.25)',
        }}
      >
        {player.photoUrl ? (
          <img src={player.photoUrl} alt={player.name} className="size-24 rounded-full object-cover" />
        ) : (
          initials(player.name)
        )}
      </div>

      {/* name + meta */}
      <div className="relative text-center font-display font-extrabold" style={{ fontSize: 22 }}>
        {player.name}
      </div>
      <div
        className="relative text-center"
        style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 14 }}
      >
        {player.age ? `${player.age} anos · ` : ''}
        {player.heightCm ? `${formatHeight(player.heightCm)} · ` : ''}
        {player.dominantHand ? `${player.dominantHand.toLowerCase()} · ` : ''}
        {player.wins}V {player.losses}D
      </div>

      {/* attributes grid */}
      <div className="relative grid grid-cols-2" style={{ gap: '7px 16px' }}>
        {SKILL_ORDER.map((k) => {
          const val = player.skills[k] ?? 0
          return (
            <div key={k} className="flex items-center" style={{ gap: 8 }}>
              <span
                className="font-bold uppercase"
                style={{ fontSize: 10, letterSpacing: '0.05em', color: 'rgba(255,255,255,.65)', width: 42 }}
              >
                {SKILL_ABBR[k]}
              </span>
              <span
                className="overflow-hidden"
                style={{ flex: 1, height: 5, borderRadius: 999, background: 'rgba(255,255,255,.16)' }}
              >
                <i
                  className="block h-full"
                  style={{ width: `${(val / 5) * 100}%`, background: 'var(--color-yellow-400)', borderRadius: 999 }}
                />
              </span>
              <span
                className="font-num font-black text-right"
                style={{ fontSize: 14, width: 18 }}
              >
                {val}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
