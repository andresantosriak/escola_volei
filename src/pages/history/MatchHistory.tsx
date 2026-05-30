import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History as HistoryIcon } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { EmptyState } from '@/components/layouts/EmptyState'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Select } from '@/components/ui/select'
import { ResultCard } from '@/components/history/ResultCard'
import { useMatches } from '@/hooks/use-matches'
import { useClasses } from '@/hooks/use-classes'

export default function MatchHistory() {
  const navigate = useNavigate()
  const [teamId, setTeamId] = useState('')
  const { data: classes } = useClasses()
  const { data: matches, isLoading, isError } = useMatches(teamId || undefined)

  return (
    <>
      <Header title="Histórico" subtitle="Partidas registradas" />
      <div className="p-4">
        {classes && classes.length > 0 && (
          <div className="mb-4">
            <Select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="Todas as turmas"
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
        )}

        {isLoading && <FullPageSpinner label="Carregando histórico…" />}
        {isError && <p className="py-8 text-center text-sm text-loss">Erro ao carregar histórico.</p>}
        {matches && matches.length === 0 && (
          <EmptyState
            icon={HistoryIcon}
            title="Sem partidas registradas"
            description="Monte os times e registre o resultado de um jogo para começar o histórico."
          />
        )}
        {matches && matches.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {matches.map((m) => (
              <ResultCard key={m.id} match={m} onClick={() => navigate(`/history/${m.id}`)} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
