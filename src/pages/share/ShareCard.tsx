import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, Share2 } from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  SharePreview,
  type ShareData,
  type ShareFormat,
  type ShareTheme,
} from '@/components/share/SharePreview'
import { useShareImage } from '@/hooks/use-share-image'
import { useMatch } from '@/hooks/use-matches'
import { useStudent } from '@/hooks/use-students'
import { firstName, formatMatchCardDate } from '@/lib/format'

export default function ShareCard() {
  const [params] = useSearchParams()
  const matchId = params.get('match') ?? undefined
  const studentId = params.get('student') ?? undefined

  const { ref, generating, download, share } = useShareImage()
  const [format, setFormat] = useState<ShareFormat>('square')
  const [theme, setTheme] = useState<ShareTheme>('green')
  const [includeRosters, setIncludeRosters] = useState(true)
  const [includeSets, setIncludeSets] = useState(true)
  const [includeBalance, setIncludeBalance] = useState(true)

  const { data: match, isLoading: loadingMatch } = useMatch(matchId)
  const { data: student, isLoading: loadingStudent } = useStudent(studentId)

  if ((matchId && loadingMatch) || (studentId && loadingStudent)) return <FullPageSpinner />
  if (!matchId && !studentId) {
    return (
      <>
        <ScreenHeader title="Compartilhar" back />
        <p className="p-8 text-center text-sm text-fg-3">Nada para compartilhar.</p>
      </>
    )
  }

  let data: ShareData
  let filename = 'esporte-recreacao.png'
  if (match) {
    const setsA = match.sets.filter((s) => s.points_a > s.points_b).length
    const setsB = match.sets.filter((s) => s.points_b > s.points_a).length
    data = {
      kind: 'match',
      teamAName: match.team_a_name,
      teamBName: match.team_b_name,
      setsA,
      setsB,
      winner: match.winner as 'a' | 'b' | null,
      setSummary: match.sets.map((s) => `${s.points_a}–${s.points_b}`).join('  ·  '),
      date: formatMatchCardDate(match.match_date),
      className: match.team_name,
      balance: match.balance_score,
      rosterA: match.rostersA.map((s) => firstName(s.name)),
      rosterB: match.rostersB.map((s) => firstName(s.name)),
      includeRosters,
      includeSets,
      includeBalance,
    }
    filename = 'resultado.png'
  } else if (student) {
    data = {
      kind: 'player',
      name: student.name,
      position: student.position,
      overall: student.overall,
      wins: student.wins,
      losses: student.losses,
      skills: student.skills,
    }
    filename = `card-${firstName(student.name).toLowerCase()}.png`
  } else {
    return null
  }

  const onShare = async () => {
    const ok = await share(filename, 'Esporte Recreacao')
    if (ok) toast.success('Imagem pronta!')
  }
  const onDownload = async () => {
    await download(filename)
    toast.success('Imagem salva!')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <ScreenHeader title="Compartilhar" back />

      <div className="flex-1 overflow-y-auto pb-[calc(var(--bottom-nav-h)+112px)]">
        {/* ---- Preview area ---- */}
        <div className="flex min-h-[320px] items-center justify-center bg-sunken px-[18px] py-4">
          <div className="overflow-hidden rounded-[22px]" style={{ boxShadow: 'var(--shadow-card)' }}>
            <SharePreview ref={ref} data={data} format={format} theme={theme} />
          </div>
        </div>

        {/* ---- Options body ---- */}
        <div className="px-[18px]">
          {/* Formato */}
          <p className="mb-[9px] mt-[22px] font-body text-[11px] font-bold uppercase tracking-[.05em] text-fg-3">
            Formato
          </p>
          <Segmented
            value={format}
            onChange={(v) => setFormat(v as ShareFormat)}
            options={[
              { value: 'square', label: 'quadrado' },
              { value: 'portrait', label: 'vertical' },
              { value: 'landscape', label: 'paisagem' },
            ]}
          />

          {/* O que incluir (match only) */}
          {data.kind === 'match' && (
            <>
              <p className="mb-[9px] mt-[22px] font-body text-[11px] font-bold uppercase tracking-[.05em] text-fg-3">
                O que incluir
              </p>
              <div className="overflow-hidden rounded-[14px] bg-surface shadow-sm">
                <OptionRow label="Elencos" checked={includeRosters} onChange={setIncludeRosters} />
                <OptionRow label="Placar set a set" checked={includeSets} onChange={setIncludeSets} border />
                <OptionRow label="Indice de equilibrio" checked={includeBalance} onChange={setIncludeBalance} border />
              </div>
            </>
          )}

          {/* Tema */}
          <p className="mb-[9px] mt-[22px] font-body text-[11px] font-bold uppercase tracking-[.05em] text-fg-3">
            Tema
          </p>
          <Segmented
            value={theme}
            onChange={(v) => setTheme(v as ShareTheme)}
            options={[
              { value: 'green', label: 'verde' },
              { value: 'dark', label: 'escuro' },
              { value: 'light', label: 'claro' },
            ]}
          />
        </div>
      </div>

      {/* ---- Bottom dock ---- */}
      <div className="fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-30 mx-auto flex max-w-[440px] gap-[10px] border-t border-border-1 bg-surface/95 px-[18px] py-4 pb-4 backdrop-blur">
        <Button variant="secondary" full onClick={onDownload} disabled={generating}>
          <Download size={18} /> Salvar
        </Button>
        <Button full onClick={onShare} disabled={generating}>
          <Share2 size={18} /> {generating ? 'Gerando...' : 'Compartilhar'}
        </Button>
      </div>
    </div>
  )
}

/* ---- Toggle row inside "O que incluir" card ---- */
function OptionRow({
  label,
  checked,
  onChange,
  border,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  border?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between px-[14px] py-[13px] ${border ? 'border-t border-border-1' : ''}`}
    >
      <span className="font-body text-[15px] font-semibold text-fg-1">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  )
}
