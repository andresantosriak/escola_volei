import { useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
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
import { useActiveTechnicalSkills } from '@/hooks/use-skills-config'
import { firstName } from '@/lib/format'
import type { AssemblyMode, BenchPolicy } from '@/engine'

export default function BuildTeams() {
  const navigate = useNavigate()
  const { teamId, present, setResult: persistResult } = useTraining()
  const { data: activeSkills } = useActiveTechnicalSkills()

  // Montar skillWeights a partir dos fundamentos tecnicos ativos: { key: weight }
  const skillWeights = useMemo(() => {
    if (!activeSkills || activeSkills.length === 0) return undefined
    const w: Record<string, number> = {}
    for (const s of activeSkills) w[s.key] = s.weight
    return w
  }, [activeSkills])

  const { result, build, swapPlayer } = useTeamBuilder(present, skillWeights)
  const [mode, setMode] = useState<AssemblyMode>('competitive')
  const [size, setSize] = useState(6)
  const [benchPolicy, setBenchPolicy] = useState<BenchPolicy>('bench')
  const [nameA, setNameA] = useState('Furacao')
  const [nameB, setNameB] = useState('Tubaroes')

  // Redireciona pra home só se NÃO há treino ativo (sem teamId). NÃO redireciona
  // por present vazio: sob v7_startTransition esta rota pode renderizar antes do
  // contexto propagar (present transitoriamente []).
  useEffect(() => {
    if (!teamId) navigate('/', { replace: true })
  }, [teamId, navigate])

  // (Re)monta os times quando o elenco chega (>=4), quando as opções mudam, ou quando
  // os pesos dos fundamentos terminam de carregar (skillWeights) — assim, em conexão/CPU
  // lenta, o primeiro build (sem pesos) é refeito com os pesos aplicados.
  useEffect(() => {
    if (present.length >= 4) build({ mode, size, benchPolicy })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present.length, mode, size, benchPolicy, skillWeights])

  const goResult = () => {
    flushSync(() => persistResult(result))
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

      <div className="px-[18px] pb-[calc(var(--bottom-nav-h)+144px)] pt-1">
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
      <div className="fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-30 px-[18px] pb-[14px] pt-[14px]"
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
