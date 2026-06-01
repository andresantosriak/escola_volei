import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, History as HistoryIcon } from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { IconButton } from '@/components/layouts/IconButton'
import { EmptyState } from '@/components/layouts/EmptyState'
import { FullPageSpinner } from '@/components/ui/spinner'
import { ResultCard } from '@/components/history/ResultCard'
import { FilterChips, type FilterMode } from '@/components/history/FilterChips'
import { FilterSubSelector } from '@/components/history/FilterSubSelector'
import { useMatches } from '@/hooks/use-matches'
import { useClasses } from '@/hooks/use-classes'
import { useStudents } from '@/hooks/use-students'
import { firstName } from '@/lib/format'

export default function MatchHistory() {
  const navigate = useNavigate()

  // Filter state
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedStudentName, setSelectedStudentName] = useState('')

  // Data
  const { data: classes } = useClasses()
  const { data: students } = useStudents()
  const { data: matches, isLoading, isError } = useMatches()

  // Active class name for subtitle
  const activeClassName = useMemo(() => {
    if (filterMode === 'by_class' && selectedClassId && classes) {
      const cls = classes.find((c) => c.id === selectedClassId)
      return cls?.name ?? null
    }
    if (classes && classes.length > 0) {
      return classes[0].name
    }
    return null
  }, [filterMode, selectedClassId, classes])

  // Class options for sub-selector
  const classOptions = useMemo(() => {
    if (!classes) return []
    return classes.map((c) => ({ value: c.id, label: c.name }))
  }, [classes])

  // Student options for sub-selector (unique first names from all matches)
  const studentOptions = useMemo(() => {
    if (!students) return []
    return students
      .map((s) => ({ value: firstName(s.name), label: firstName(s.name) }))
      .filter((v, i, arr) => arr.findIndex((o) => o.value === v.value) === i)
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [students])

  // Filtered matches
  const filteredMatches = useMemo(() => {
    if (!matches) return []

    let result = matches

    if (filterMode === 'by_class' && selectedClassId) {
      result = result.filter((m) => m.team_id === selectedClassId)
    }

    if (filterMode === 'by_student' && selectedStudentName) {
      result = result.filter((m) => {
        const allNames = [...(m.roster_a ?? []), ...(m.roster_b ?? [])]
        return allNames.some(
          (name) => name.toLowerCase() === selectedStudentName.toLowerCase(),
        )
      })
    }

    if (filterMode === 'month') {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      result = result.filter((m) => {
        const d = new Date(
          m.match_date + (m.match_date.length === 10 ? 'T00:00:00' : ''),
        )
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
    }

    return result
  }, [matches, filterMode, selectedClassId, selectedStudentName])

  // Handle filter mode change
  function handleFilterChange(mode: FilterMode) {
    setFilterMode(mode)
    if (mode !== 'by_class') setSelectedClassId('')
    if (mode !== 'by_student') setSelectedStudentName('')
  }

  return (
    <>
      <ScreenHeader
        title="Historico"
        subtitle={activeClassName ?? undefined}
        right={<IconButton icon={Filter} label="Filtros" />}
      />

      {/* Filter chips row */}
      <FilterChips active={filterMode} onChange={handleFilterChange} />

      {/* Sub-selector for "Por turma" */}
      {filterMode === 'by_class' && classOptions.length > 0 && (
        <FilterSubSelector
          options={classOptions}
          selected={selectedClassId}
          onChange={setSelectedClassId}
        />
      )}

      {/* Sub-selector for "Por aluno" */}
      {filterMode === 'by_student' && studentOptions.length > 0 && (
        <FilterSubSelector
          options={studentOptions}
          selected={selectedStudentName}
          onChange={setSelectedStudentName}
        />
      )}

      {/* Content area */}
      <div style={{ padding: '14px 18px 120px' }}>
        {isLoading && <FullPageSpinner label="Carregando historico..." />}

        {isError && (
          <p className="py-8 text-center text-sm text-loss">
            Erro ao carregar historico.
          </p>
        )}

        {!isLoading && !isError && filteredMatches.length === 0 && (
          <EmptyState
            icon={HistoryIcon}
            title="Sem partidas registradas"
            description="Monte os times e registre o resultado de um jogo para comecar o historico."
          />
        )}

        {filteredMatches.length > 0 && (
          <div className="flex flex-col" style={{ gap: 9 }}>
            {filteredMatches.map((m) => (
              <ResultCard
                key={m.id}
                match={m}
                onClick={() => navigate(`/history/${m.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
