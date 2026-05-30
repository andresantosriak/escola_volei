import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shuffle, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/students/Avatar'
import { BuildOptions } from '@/components/training/BuildOptions'
import { TeamPanel } from '@/components/training/TeamPanel'
import { BalanceIndicator } from '@/components/training/BalanceIndicator'
import { useTeamBuilder } from '@/hooks/use-team-builder'
import { useTraining } from '@/contexts/training-context'
import { firstName } from '@/lib/format'
import type { AssemblyMode } from '@/engine'

export default function BuildTeams() {
  const navigate = useNavigate()
  const { teamId, teamName, present, setResult: persistResult } = useTraining()
  const { result, build, swapPlayer } = useTeamBuilder(present)
  const [mode, setMode] = useState<AssemblyMode>('competitive')
  const [size, setSize] = useState(6)
  const [nameA, setNameA] = useState('Time A')
  const [nameB, setNameB] = useState('Time B')

  useEffect(() => {
    if (!teamId || present.length < 4) {
      navigate('/', { replace: true })
      return
    }
    build({ mode, size })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (present.length >= 4) build({ mode, size })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, size])

  const goResult = () => {
    persistResult(result)
    navigate('/training/result')
  }

  return (
    <>
      <Header title="Montar times" subtitle={teamName ?? undefined} onBack={() => navigate('/training/attendance')} />
      <div className="space-y-4 p-4 pb-28">
        <BuildOptions mode={mode} size={size} onModeChange={setMode} onSizeChange={setSize} />

        {result && (
          <>
            <BalanceIndicator result={result} />

            <div className="flex gap-2">
              <TeamPanel side="A" name={nameA} onRename={setNameA} team={result.teamA} onPlayerTap={swapPlayer} />
              <TeamPanel side="B" name={nameB} onRename={setNameB} team={result.teamB} onPlayerTap={swapPlayer} />
            </div>

            <p className="text-center text-xs text-fg-4">Toque num aluno para movê-lo entre os times</p>

            {result.bench.length > 0 && (
              <div className="rounded-lg border border-dashed border-border-1 bg-surface p-3">
                <p className="mb-2 font-body text-xs font-semibold text-fg-3">
                  Banco / rodízio ({result.bench.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.bench.map((p) => (
                    <span key={p.id} className="flex items-center gap-1.5 rounded-full bg-sunken px-2 py-1 text-xs">
                      <Avatar name={p.name} size={20} />
                      {firstName(p.name)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button variant="secondary" full onClick={() => build({ mode, size })}>
              <Shuffle size={18} /> Reequilibrar
            </Button>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] border-t border-border-1 bg-surface/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
        <Button size="lg" full onClick={goResult} disabled={!result}>
          Registrar resultado <ArrowRight size={20} />
        </Button>
      </div>
    </>
  )
}
