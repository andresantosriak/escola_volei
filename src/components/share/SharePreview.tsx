import { forwardRef } from 'react'
import { Trophy } from 'lucide-react'
import { initials, avatarColor } from '@/lib/format'
import { SKILL_ORDER, SKILL_ABBR } from '@/lib/constants'
import { BrandMark } from '@/components/layouts/BrandMark'

export type ShareFormat = 'square' | 'portrait' | 'landscape'
export type ShareTheme = 'green' | 'dark' | 'light'

const DIMENSIONS: Record<ShareFormat, { w: number; h: number }> = {
  square: { w: 320, h: 320 },
  portrait: { w: 320, h: 568 },
  landscape: { w: 360, h: 202 },
}

// Fiel a design-system/ui_kits/.../screens-share.jsx (SHARE_THEMES):
// "verde" = gradiente radial verde→azul-marinho (mesmo do PlayerCard); escuro = navy; claro = off-white.
const THEMES: Record<ShareTheme, { bg: string; fg: string; sub: string; line: string }> = {
  green: {
    bg: 'radial-gradient(120% 90% at 80% 0%, #009C3B 0%, #07204F 48%, #03112E 100%)',
    fg: '#fff',
    sub: 'rgba(255,255,255,.62)',
    line: 'rgba(255,255,255,.14)',
  },
  dark: {
    bg: 'linear-gradient(160deg, #0F2A6B, #03112E)',
    fg: '#fff',
    sub: 'rgba(255,255,255,.62)',
    line: 'rgba(255,255,255,.14)',
  },
  light: {
    bg: 'linear-gradient(160deg, #FFFFFF, #EAEEF5)',
    fg: '#10131C',
    sub: 'rgba(16,19,28,.55)',
    line: 'rgba(0,0,0,.08)',
  },
}

const GOLD = '#FFCB00'

export interface MatchShareData {
  kind: 'match'
  teamAName: string
  teamBName: string
  setsA: number
  setsB: number
  winner: 'a' | 'b' | null
  setSummary: string
  date: string
  className?: string | null
  balance: number | null
  rosterA?: string[]
  rosterB?: string[]
  includeRosters: boolean
  includeSets: boolean
  includeBalance: boolean
}

export interface PlayerShareData {
  kind: 'player'
  name: string
  position: string
  overall: number
  wins: number
  losses: number
  skills: Record<string, number>
}

export type ShareData = MatchShareData | PlayerShareData

interface SharePreviewProps {
  data: ShareData
  format: ShareFormat
  theme: ShareTheme
}

export const SharePreview = forwardRef<HTMLDivElement, SharePreviewProps>(
  ({ data, format, theme }, ref) => {
    const dim = DIMENSIONS[format]
    const t = THEMES[theme]
    const land = format === 'landscape'
    return (
      <div
        ref={ref}
        style={{
          width: dim.w,
          height: dim.h,
          background: t.bg,
          color: t.fg,
          fontFamily: "'Barlow', sans-serif",
          padding: land ? 16 : 22,
        }}
        className="relative flex flex-col overflow-hidden"
      >
        {/* sheen sutil no canto */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,.08), transparent 42%)' }}
        />
        {data.kind === 'match' ? (
          <MatchBody data={data} t={t} format={format} />
        ) : (
          <PlayerBody data={data} t={t} />
        )}
      </div>
    )
  },
)
SharePreview.displayName = 'SharePreview'

/** "Bruno Almeida" -> "Bruno A." */
function shortName(n: string): string {
  const parts = n.trim().split(/\s+/)
  return parts[1] ? `${parts[0]} ${parts[1][0]}.` : parts[0]
}

function MatchBody({
  data,
  t,
  format,
}: {
  data: MatchShareData
  t: { fg: string; sub: string; line: string }
  format: ShareFormat
}) {
  const aWin = data.winner === 'a'
  const bWin = data.winner === 'b'
  const land = format === 'landscape'
  const dark = t.fg === '#fff'
  return (
    <>
      {/* Header: marca à esquerda · data + turma à direita */}
      <div className="relative flex items-center gap-2">
        <BrandMark size={22} className="!px-0 !py-0" tone={dark ? 'on-dark' : 'default'} />
        <span
          className="ml-auto text-right font-body font-semibold leading-tight"
          style={{ fontSize: 10.5, color: t.sub }}
        >
          {data.date}
          {data.className && (
            <>
              <br />
              {data.className}
            </>
          )}
        </span>
      </div>

      {/* Centro: times + placar */}
      <div className="relative flex flex-1 flex-col items-center justify-center" style={{ gap: 6 }}>
        <div className="flex items-center justify-center" style={{ gap: land ? 14 : 18 }}>
          <div className="text-center" style={{ maxWidth: 110 }}>
            {aWin && <Trophy size={18} style={{ color: GOLD, margin: '0 auto 2px' }} />}
            <div
              style={{ fontFamily: "'Archivo'", fontWeight: 800, fontSize: 15, color: aWin ? GOLD : t.fg }}
            >
              {data.teamAName}
            </div>
          </div>
          <div
            style={{
              fontFamily: "'Barlow Semi Condensed', 'Barlow', sans-serif",
              fontWeight: 900,
              fontSize: land ? 34 : 44,
              letterSpacing: '-.03em',
              color: t.fg,
              whiteSpace: 'nowrap',
            }}
          >
            {data.setsA} <span style={{ color: t.sub, fontSize: '.6em' }}>×</span> {data.setsB}
          </div>
          <div className="text-center" style={{ maxWidth: 110 }}>
            {bWin && <Trophy size={18} style={{ color: GOLD, margin: '0 auto 2px' }} />}
            <div
              style={{ fontFamily: "'Archivo'", fontWeight: 800, fontSize: 15, color: bWin ? GOLD : t.fg }}
            >
              {data.teamBName}
            </div>
          </div>
        </div>

        {data.includeSets && data.setSummary && (
          <div
            className="font-semibold tabular-nums"
            style={{ fontSize: 11, color: t.sub }}
          >
            {data.setSummary}
          </div>
        )}

        {data.includeBalance && data.balance != null && (
          <div
            style={{
              marginTop: 4,
              fontSize: 10.5,
              fontWeight: 700,
              color: '#0B0F1F',
              background: GOLD,
              padding: '3px 10px',
              borderRadius: 999,
            }}
          >
            Jogo equilibrado: {data.balance}%
          </div>
        )}
      </div>

      {/* Elencos */}
      {data.includeRosters && !land && (
        <div
          className="relative grid grid-cols-2"
          style={{
            gap: 10,
            fontSize: 9.5,
            color: t.sub,
            lineHeight: 1.5,
            borderTop: `1px solid ${t.line}`,
            paddingTop: 10,
          }}
        >
          <div>
            {(data.rosterA ?? []).map((n, i) => (
              <div key={`a-${i}-${n}`} className="truncate">
                {shortName(n)}
              </div>
            ))}
          </div>
          <div className="text-right">
            {(data.rosterB ?? []).map((n, i) => (
              <div key={`b-${i}-${n}`} className="truncate">
                {shortName(n)}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function PlayerBody({
  data,
  t,
}: {
  data: PlayerShareData
  t: { fg: string; sub: string }
}) {
  const [bg] = avatarColor(data.name)
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center">
      <div className="flex items-center gap-3 self-stretch">
        <span style={{ fontFamily: "'Archivo'", fontWeight: 900, color: GOLD }} className="text-5xl">
          {data.overall}
        </span>
        <span style={{ color: t.sub }} className="text-xs font-bold uppercase tracking-widest">
          Geral
        </span>
        <span
          style={{ background: GOLD, color: '#03112E' }}
          className="ml-auto rounded-full px-2 py-0.5 text-xs font-bold"
        >
          {data.position || '—'}
        </span>
      </div>
      <div
        className="my-3 flex size-20 items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 35%, #1BAE57, ${bg})`,
          fontFamily: "'Archivo'",
          fontWeight: 900,
          fontSize: 30,
          color: '#fff',
        }}
      >
        {initials(data.name)}
      </div>
      <div style={{ fontFamily: "'Archivo'", fontWeight: 800 }} className="text-center text-lg">
        {data.name}
      </div>
      <div style={{ color: t.sub }} className="flex items-center gap-1 text-xs">
        <Trophy size={12} /> {data.wins}V {data.losses}D
      </div>
      <div className="mt-3 grid w-full grid-cols-2 gap-x-3 gap-y-1.5">
        {SKILL_ORDER.map((k) => (
          <div key={k} className="flex items-center gap-1.5">
            <span style={{ color: t.sub }} className="w-7 text-[10px] font-bold uppercase">
              {SKILL_ABBR[k]}
            </span>
            <span
              className="h-1 flex-1 overflow-hidden rounded-full"
              style={{ background: 'rgba(255,255,255,.2)' }}
            >
              <i
                className="block h-full rounded-full"
                style={{ width: `${((data.skills[k] ?? 0) / 5) * 100}%`, background: GOLD }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
