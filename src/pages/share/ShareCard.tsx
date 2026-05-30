import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, Share2 } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
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
import { firstName, formatDateFull } from '@/lib/format'

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
        <Header title="Compartilhar" back />
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
      setSummary: match.sets.map((s) => `${s.points_a}–${s.points_b}`).join(' · '),
      date: formatDateFull(match.match_date),
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
    const ok = await share(filename, 'Esporte Recreação')
    if (ok) toast.success('Imagem pronta!')
  }
  const onDownload = async () => {
    await download(filename)
    toast.success('Imagem salva!')
  }

  return (
    <>
      <Header title="Compartilhar" back />
      <div className="space-y-4 p-4 pb-28">
        <div className="flex justify-center rounded-xl bg-sunken p-4">
          <div className="overflow-hidden rounded-xl shadow-lg">
            <SharePreview ref={ref} data={data} format={format} theme={theme} />
          </div>
        </div>

        <div>
          <p className="mb-1.5 font-body text-xs font-semibold text-fg-3">Formato</p>
          <Segmented
            value={format}
            onChange={(v) => setFormat(v as ShareFormat)}
            options={[
              { value: 'square', label: 'Quadrado' },
              { value: 'portrait', label: 'Vertical' },
              { value: 'landscape', label: 'Paisagem' },
            ]}
          />
        </div>

        <div>
          <p className="mb-1.5 font-body text-xs font-semibold text-fg-3">Tema</p>
          <Segmented
            value={theme}
            onChange={(v) => setTheme(v as ShareTheme)}
            options={[
              { value: 'green', label: 'Verde' },
              { value: 'dark', label: 'Escuro' },
              { value: 'light', label: 'Claro' },
            ]}
          />
        </div>

        {data.kind === 'match' && (
          <div className="flex flex-col gap-3 rounded-lg border border-border-1 bg-surface p-3">
            <Row label="Incluir elencos" checked={includeRosters} onChange={setIncludeRosters} />
            <Row label="Incluir sets" checked={includeSets} onChange={setIncludeSets} />
            <Row label="Incluir equilíbrio" checked={includeBalance} onChange={setIncludeBalance} />
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] gap-2 border-t border-border-1 bg-surface/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
        <Button variant="secondary" full onClick={onDownload} disabled={generating}>
          <Download size={18} /> Salvar
        </Button>
        <Button full onClick={onShare} disabled={generating}>
          <Share2 size={18} /> {generating ? 'Gerando…' : 'Compartilhar'}
        </Button>
      </div>
    </>
  )
}

function Row({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  )
}
