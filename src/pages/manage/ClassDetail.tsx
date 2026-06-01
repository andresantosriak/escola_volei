import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  BarChart3,
  Building2,
  Calendar,
  Cake,
  Play,
  Trash2,
  User,
  UsersRound,
  X,
} from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { InfoRow } from '@/components/manage/InfoRow'
import { Avatar } from '@/components/students/Avatar'
import { classSchema, type ClassInput } from '@/schemas/class-schema'
import { TEAM_LEVELS } from '@/lib/constants'
import { useClass, useClassMutations } from '@/hooks/use-classes'
import { useBranches } from '@/hooks/use-branches'
import { useTeamRoster } from '@/hooks/use-students'

export default function ClassDetail() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const { data: team, isLoading } = useClass(isNew ? undefined : id)
  const { data: branches } = useBranches()
  const { data: roster } = useTeamRoster(isNew ? undefined : id)
  const { create, update, remove } = useClassMutations()

  const [editing, setEditing] = useState(isNew)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassInput>({
    resolver: zodResolver(classSchema),
    defaultValues: { level: 'Iniciante' },
  })

  useEffect(() => {
    if (team)
      reset({
        name: team.name,
        branch_id: team.branch_id,
        schedule_days: team.schedule_days,
        schedule_time: team.schedule_time ?? '',
        level: team.level as ClassInput['level'],
        age_group: team.age_group,
        instructor_name: team.instructor_name,
      })
  }, [team, reset])

  const onSubmit = async (data: ClassInput) => {
    try {
      if (isNew) {
        await create.mutateAsync(data)
        toast.success('Turma criada!')
        navigate('/manage/classes', { replace: true })
      } else {
        await update.mutateAsync({ id: id!, input: data })
        toast.success('Turma atualizada!')
        setEditing(false)
      }
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const onDelete = async () => {
    try {
      await remove.mutateAsync(id!)
      toast.success('Turma excluida.')
      navigate('/manage/classes', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
      setConfirmDelete(false)
    }
  }

  if (!isNew && isLoading) return <FullPageSpinner />
  const saving = create.isPending || update.isPending
  const branchOptions = (branches ?? []).map((b) => ({ value: b.id, label: b.name }))
  const branchName = branches?.find((b) => b.id === team?.branch_id)?.name

  /* -- right header element -- */
  const headerRight = !isNew && !editing ? (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="rounded-[12px] bg-surface px-[14px] py-[6px] font-display text-[15px] font-bold text-green-600 shadow-sm active:opacity-70"
    >
      Editar
    </button>
  ) : undefined

  return (
    <>
      <ScreenHeader
        title={isNew ? 'Nova turma' : team?.name || 'Turma'}
        back
        right={headerRight}
      />

      <div className="px-[18px] pb-32 pt-1">
        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Nome da turma *" error={errors.name?.message}>
              <Input placeholder="Ex.: Sub-17 Masculino" {...register('name')} />
            </Field>
            <Field label="Filial *" error={errors.branch_id?.message}>
              <Select placeholder="Selecione a filial" options={branchOptions} {...register('branch_id')} />
            </Field>
            <div className="flex gap-3">
              <Field label="Dias" className="flex-1">
                <Input placeholder="Seg . Qua . Sex" {...register('schedule_days')} />
              </Field>
              <Field label="Horario" className="flex-1">
                <Input type="time" {...register('schedule_time')} />
              </Field>
            </div>
            <div className="flex gap-3">
              <Field label="Nivel" error={errors.level?.message} className="flex-1">
                <Select options={TEAM_LEVELS.map((l) => ({ value: l, label: l }))} {...register('level')} />
              </Field>
              <Field label="Faixa etaria" className="flex-1">
                <Input placeholder="15-17 anos" {...register('age_group')} />
              </Field>
            </div>
            <Field label="Professor responsavel">
              <Input placeholder="Nome" {...register('instructor_name')} />
            </Field>
            <div className="mt-2 flex gap-2">
              {!isNew && (
                <Button type="button" variant="secondary" full onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" full disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        ) : (
          team && (
            <>
              {/* Info group card */}
              <div className="overflow-hidden rounded-[14px] bg-surface shadow-sm">
                <InfoRow icon={UsersRound} label="Turma" value={team.name} />
                <InfoRow icon={Building2} label="Filial" value={branchName} />
                <InfoRow
                  icon={Calendar}
                  label="Dias e horario"
                  value={
                    [team.schedule_days, team.schedule_time?.slice(0, 5)]
                      .filter(Boolean)
                      .join(' · ') || undefined
                  }
                />
                <InfoRow icon={BarChart3} label="Nivel" value={team.level} />
                <InfoRow icon={Cake} label="Faixa etaria" value={team.age_group} />
                <InfoRow icon={User} label="Professor" value={team.instructor_name} />
              </div>

              {/* Enrolled students */}
              <div className="mt-[22px] flex items-center justify-between px-0.5">
                <h3 className="font-display text-[16px] font-extrabold text-fg-1">
                  Alunos matriculados{' '}
                  <span className="font-body font-medium text-fg-3">
                    &middot; {roster?.length ?? 0}
                  </span>
                </h3>
                <button
                  type="button"
                  className="whitespace-nowrap font-body text-[13px] font-bold text-green-600"
                >
                  + Adicionar
                </button>
              </div>

              {roster && roster.length > 0 ? (
                <div className="mt-[10px] flex flex-wrap gap-2">
                  {roster.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => navigate(`/students/${s.id}`)}
                      className="inline-flex items-center gap-[9px] rounded-full border border-border-1 bg-surface py-[5px] pl-[5px] pr-[14px] font-body text-[14px] font-semibold text-fg-1 transition-colors active:bg-sunken"
                    >
                      <Avatar name={s.name} size={32} />
                      {s.name.split(' ')[0]}
                      <X size={14} className="text-fg-4" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-[14px] bg-sunken px-3 py-4 text-center font-body text-sm text-fg-3">
                  Nenhum aluno nesta turma ainda.
                </p>
              )}

              {/* Actions */}
              <div className="mt-[22px] flex flex-col gap-[10px]">
                <Button full size="lg" onClick={() => navigate(`/training?teamId=${id}`)}>
                  <Play size={18} /> Iniciar treino
                </Button>
                <Button
                  variant="ghost"
                  full
                  className="text-loss"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={18} /> Excluir turma
                </Button>
              </div>
            </>
          )
        )}
      </div>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir turma?">
        <p className="mb-5 font-body text-sm text-fg-2">
          Esta acao e irreversivel. Os alunos nao serao excluidos, apenas desvinculados desta turma.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" full onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button variant="danger" full onClick={onDelete} disabled={remove.isPending}>
            Excluir
          </Button>
        </div>
      </Sheet>
    </>
  )
}
