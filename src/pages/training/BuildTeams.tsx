import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shuffle, Flag } from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { IconButton } from '@/components/layouts/IconButton'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/students/Avatar'
import { BuildOptions } from '@/components/training/BuildOptions'
import { TeamPanel } from '@/components/training/TeamPanel'
import { BalanceIndicator } from '@/components/training/BalanceIndicator'
import { useTeamBuilder } from '@/hooks/use-team-builder'
import { useTraining } from '@/contexts/training-context'
import { firstName } from '@/lib/format'
import type { AssemblyMode, BenchPolicy } from '@/engine'

export default function BuildTeams() {
  const navigate = useNavigate()
  const { teamId, present, setResult: persistResult } = useTraining()
  const { result, build, swapPlayer } = useTeamBuilder(present)
  const [mode, setMode] = useState<AssemblyMode>('competitive')
  const [size, setSize] = useState(6)
  const [benchPolicy, setBenchPolicy] = useState<BenchPolicy>('bench')
  const [nameA, setNameA] = useState('Furacao')
  const [nameB, setNameB] = useState('Tubaroes')

  useEffect(() => {
    if (!teamId || present.length < 4) {
      navigate('/', { replace: true })
      return
    }
    build({ mode, size, benchPolicy })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (present.length >= 4) build({ mode, size, benchPolicy })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, size, benchPolicy])

  const goResult = () => {
    persistResult(result)
    navigate('/training/result')
  }

  const totalOnCourt = result ? result.teamA.length + result.teamB.length : 0
  const totalBench = result ? result.bench.length : 0

  return (
    <>
      <ScreenHeader
        title="Montar times"
        subtitle={`${totalOnCourt} em quadra · ${totalBench} no banco`}
        back
        onBack={() => navigate('/training/attendance')}
        right={
          <IconButton
            icon={Shuffle}
            label="Reequilibrar"
            onClick={() => build({ mode, size, benchPolicy })}
          />
        }
      />

      <div className="px-[18px] pb-36 pt-1">
        {/* Build options card */}
        <BuildOptions
          mode={mode}
          size={size}
          benchPolicy={benchPolicy}
          onModeChange={setMode}
          onSizeChange={setSize}
          onBenchPolicyChange={setBenchPolicy}
        />

        {result && (
          <>
            {/* Balance indicator */}
            <div className="mt-[14px]">
              <BalanceIndicator result={result} />
            </div>

            {/* Team panels grid */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <TeamPanel side="A" name={nameA} onRename={setNameA} team={result.teamA} onPlayerTap={swapPlayer} />
              <TeamPanel side="B" name={nameB} onRename={setNameB} team={result.teamB} onPlayerTap={swapPlayer} />
            </div>

            {/* Hint text */}
            <p className="mx-[6px] mt-3 text-center font-body text-[11.5px] text-fg-4">
              Toque em um aluno para troca-lo de time — o indice recalcula na hora.
            </p>

            {/* Bench */}
            {result.bench.length > 0 && (
              <>
                <div className="mx-0.5 mt-[22px] mb-[10px] flex items-center justify-between">
                  <span className="font-display text-[16px] font-extrabold text-fg-1">
                    Banco / rodizio
                  </span>
                  <span className="font-body text-[13px] font-bold text-green-600">
                    {result.bench.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.bench.map((p) => (
                    <span
                      key={p.id}
                      className="flex items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1.5 font-body text-[13px] font-medium text-fg-2"
                    >
                      <Avatar name={p.name} size={32} />
                      {firstName(p.name)}
                      {p.position && (
                        <span className="font-body text-[11px] font-bold text-fg-3">
                          {p.position}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Rebalance button */}
            <div className="mt-[18px]">
              <Button variant="secondary" full onClick={() => build({ mode, size, benchPolicy })}>
                <Shuffle size={18} /> Reequilibrar
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Bottom dock */}
      <div className="fixed inset-x-0 bottom-0 z-20 px-[18px] pb-[calc(14px+env(safe-area-inset-bottom))] pt-[14px]"
        style={{ background: 'linear-gradient(to top, var(--color-app) 62%, transparent)' }}
      >
        <div className="mx-auto max-w-[440px]">
          <Button size="lg" full onClick={goResult} disabled={!result}>
            <Flag size={20} /> Registrar resultado
          </Button>
        </div>
      </div>
    </>
  )
}
