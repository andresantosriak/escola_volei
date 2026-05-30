import { forwardRef } from 'react'
import { Trophy } from 'lucide-react'
import { initials, avatarColor } from '@/lib/format'
import { SKILL_ORDER, SKILL_ABBR } from '@/lib/constants'

export type ShareFormat = 'square' | 'portrait' | 'landscape'
export type ShareTheme = 'green' | 'dark' | 'light'

const DIMENSIONS: Record<ShareFormat, { w: number; h: number }> = {
  square: { w: 320, h: 320 },
  portrait: { w: 320, h: 568 },
  landscape: { w: 360, h: 202 },
}

const THEMES: Record<ShareTheme, { bg: string; fg: string; sub: string; accent: string }> = {
  green: { bg: 'linear-gradient(150deg,#009C3B,#006B29)', fg: '#fff', sub: 'rgba(255,255,255,.75)', accent: '#FFCB00' },
  dark: { bg: 'linear-gradient(150deg,#07204F,#03112E)', fg: '#fff', sub: 'rgba(255,255,255,.7)', accent: '#FFCB00' },
  light: { bg: 'linear-gradient(150deg,#FFFFFF,#F4F6FB)', fg: '#10131C', sub: '#6B7488', accent: '#009C3B' },
}

export interface MatchShareData {
  kind: 'match'
  teamAName: string
  teamBName: string
  setsA: number
  setsB: number
  winner: 'a' | 'b' | null
  setSummary: string
  date: string
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
    return (
      <div
        ref={ref}
        style={{
          width: dim.w,
          height: dim.h,
          background: t.bg,
          color: t.fg,
          fontFamily: "'Barlow', sans-serif",
        }}
        className="relative flex flex-col overflow-hidden p-5"
      >
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: "'Archivo'", fontWeight: 900 }} className="text-sm">
            ESPORTE RECREAÇÃO
          </span>
          <span style={{ background: t.accent }} className="size-2.5 rounded-full" />
        </div>

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

function MatchBody({
  data,
  t,
  format,
}: {
  data: MatchShareData
  t: { fg: string; sub: string; accent: string }
  format: ShareFormat
}) {
  const aWin = data.winner === 'a'
  const bWin = data.winner === 'b'
  return (
    <div className="flex flex-1 flex-col justify-center">
      <p style={{ color: t.sub }} className="text-center text-xs">
        {data.date}
      </p>
      <div className="my-3 flex items-center justify-center gap-3">
        <div className="flex-1 text-right">
          <div style={{ fontFamily: "'Archivo'", fontWeight: 800 }} className="text-base leading-tight">
            {aWin && '🏆 '}
            {data.teamAName}
          </div>
        </div>
        <div style={{ fontFamily: "'Barlow Semi Condensed'", fontWeight: 800 }} className="text-4xl">
          <span style={{ color: aWin ? t.accent : t.fg }}>{data.setsA}</span>
          <span style={{ color: t.sub }} className="mx-1 text-2xl">×</span>
          <span style={{ color: bWin ? t.accent : t.fg }}>{data.setsB}</span>
        </div>
        <div className="flex-1 text-left">
          <div style={{ fontFamily: "'Archivo'", fontWeight: 800 }} className="text-base leading-tight">
            {data.teamBName}
            {bWin && ' 🏆'}
          </div>
        </div>
      </div>

      {data.includeSets && data.setSummary && (
        <p style={{ color: t.sub }} className="text-center text-sm">
          {data.setSummary}
        </p>
      )}
      {data.includeBalance && data.balance != null && (
        <p style={{ color: t.accent }} className="mt-1 text-center text-xs font-bold">
          Equilíbrio {data.balance}%
        </p>
      )}

      {data.includeRosters && format !== 'landscape' && (
        <div className="mt-4 flex gap-3 text-[11px]" style={{ color: t.sub }}>
          <div className="flex-1">
            {(data.rosterA ?? []).map((n, i) => (
              <div key={`a-${i}-${n}`} className="truncate">{n}</div>
            ))}
          </div>
          <div className="flex-1 text-right">
            {(data.rosterB ?? []).map((n, i) => (
              <div key={`b-${i}-${n}`} className="truncate">{n}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerBody({
  data,
  t,
}: {
  data: PlayerShareData
  t: { fg: string; sub: string; accent: string }
}) {
  const [bg] = avatarColor(data.name)
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex items-center gap-3 self-stretch">
        <span style={{ fontFamily: "'Archivo'", fontWeight: 900, color: t.accent }} className="text-5xl">
          {data.overall}
        </span>
        <span style={{ color: t.sub }} className="text-xs font-bold uppercase tracking-widest">
          Geral
        </span>
        <span style={{ background: t.accent, color: '#03112E' }} className="ml-auto rounded-full px-2 py-0.5 text-xs font-bold">
          {data.position || '—'}
        </span>
      </div>
      <div
        className="my-3 flex size-20 items-center justify-center rounded-full"
        style={{ background: `radial-gradient(circle at 50% 35%, #1BAE57, ${bg})`, fontFamily: "'Archivo'", fontWeight: 900, fontSize: 30, color: '#fff' }}
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
            <span style={{ color: t.sub }} className="w-7 text-[10px] font-bold uppercase">{SKILL_ABBR[k]}</span>
            <span className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,.2)' }}>
              <i className="block h-full rounded-full" style={{ width: `${((data.skills[k] ?? 0) / 5) * 100}%`, background: t.accent }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
