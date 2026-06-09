import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UsersRound, Plus, ChevronRight } from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { IconButton } from '@/components/layouts/IconButton'
import { EmptyState } from '@/components/layouts/EmptyState'
import { FullPageSpinner } from '@/components/ui/spinner'
import { NivelTag } from '@/components/layouts/NivelTag'
import { useClasses } from '@/hooks/use-classes'
import { useBranches } from '@/hooks/use-branches'
import { pluralize } from '@/lib/format'

export default function Classes() {
  const navigate = useNavigate()
  const [branchFilter, setBranchFilter] = useState<string>('all')
  const { data: branches } = useBranches()
  const { data: classes, isLoading, isError } = useClasses(
    branchFilter === 'all' ? undefined : branchFilter,
  )

  const filters = [
    { id: 'all', label: 'Todas' },
    ...(branches ?? []).map((b) => ({ id: b.id, label: b.name })),
  ]

  return (
    <>
      <ScreenHeader
        title="Turmas"
        back
        right={
          <IconButton
            icon={Plus}
            label="Nova turma"
            onClick={() => navigate('/manage/classes/new')}
          />
        }
      />

      {/* Horizontal pill filter bar */}
      {filters.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-[18px] pb-2 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setBranchFilter(f.id)}
              className={
                'flex-none whitespace-nowrap rounded-full px-[14px] py-[7px] font-body text-[13px] font-bold transition-colors ' +
                (branchFilter === f.id
                  ? 'bg-green-500 text-white'
                  : 'bg-surface text-fg-2 shadow-sm')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="px-[18px] pt-3.5 pb-[calc(var(--bottom-nav-h)+24px)]">
        {isLoading && <FullPageSpinner label="Carregando turmas..." />}
        {isError && (
          <p className="py-8 text-center text-sm text-loss">
            Erro ao carregar turmas.
          </p>
        )}
        {classes && classes.length === 0 && (
          <EmptyState
            icon={UsersRound}
            title="Nenhuma turma ainda"
            description="Crie uma turma vinculada a uma filial para começar a cadastrar alunos."
            ctaLabel="Criar turma"
            onCta={() => navigate('/manage/classes/new')}
          />
        )}
        {classes && classes.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {classes.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/manage/classes/${c.id}`)}
                className="flex w-full items-center gap-3 rounded-[18px] bg-surface px-4 py-3.5 text-left shadow-sm transition-colors active:scale-[0.99] active:bg-sunken"
              >
                {/* Leading icon */}
                <div className="flex size-[44px] shrink-0 items-center justify-center rounded-[14px] bg-green-50 text-green-600">
                  <UsersRound size={21} />
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-[16px] font-extrabold text-fg-1">
                    {c.name}
                  </div>
                  <div className="mt-0.5 truncate font-body text-[12.5px] text-fg-3">
                    {[c.branch_name, c.schedule_days, c.schedule_time]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <NivelTag level={c.level} />
                    <span className="font-body text-[12px] font-semibold text-fg-4">
                      {pluralize(c.student_count, 'aluno', 'alunos')}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight size={20} className="shrink-0 text-fg-4" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
