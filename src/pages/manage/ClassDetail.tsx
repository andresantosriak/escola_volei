import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Trash2, Users } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
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
      toast.success('Turma excluída.')
      navigate('/manage/classes', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
      setConfirmDelete(false)
    }
  }

  if (!isNew && isLoading) return <FullPageSpinner />
  const saving = create.isPending || update.isPending
  const branchOptions = (branches ?? []).map((b) => ({ value: b.id, label: b.name }))

  return (
    <>
      <Header title={isNew ? 'Nova turma' : team?.name || 'Turma'} back />
      <div className="p-4">
        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Nome *" error={errors.name?.message}>
              <Input placeholder="Sub-17 Masculino" {...register('name')} />
            </Field>
            <Field label="Filial *" error={errors.branch_id?.message}>
              <Select placeholder="Selecione a filial" options={branchOptions} {...register('branch_id')} />
            </Field>
            <Field label="Dias">
              <Input placeholder="Seg · Qua · Sex" {...register('schedule_days')} />
            </Field>
            <Field label="Horário">
              <Input type="time" {...register('schedule_time')} />
            </Field>
            <Field label="Nível" error={errors.level?.message}>
              <Select options={TEAM_LEVELS.map((l) => ({ value: l, label: l }))} {...register('level')} />
            </Field>
            <Field label="Faixa etária">
              <Input placeholder="15–17 anos" {...register('age_group')} />
            </Field>
            <Field label="Professor">
              <Input placeholder="Téc. Marcos" {...register('instructor_name')} />
            </Field>
            <div className="mt-2 flex gap-2">
              {!isNew && (
                <Button type="button" variant="secondary" full onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" full disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </form>
        ) : (
          team && (
            <>
              <div className="rounded-lg border border-border-1 bg-surface px-4 py-1">
                <InfoRow label="Nome" value={team.name} />
                <InfoRow label="Dias" value={team.schedule_days} />
                <InfoRow label="Horário" value={team.schedule_time?.slice(0, 5)} />
                <InfoRow label="Nível" value={team.level} />
                <InfoRow label="Faixa etária" value={team.age_group} />
                <InfoRow label="Professor" value={team.instructor_name} />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center gap-2 px-0.5">
                  <Users size={16} className="text-fg-3" />
                  <h3 className="font-body text-sm font-semibold text-fg-2">
                    Alunos ({roster?.length ?? 0})
                  </h3>
                </div>
                {roster && roster.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {roster.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => navigate(`/students/${s.id}`)}
                        className="flex items-center gap-3 rounded-lg border border-border-1 bg-surface px-3 py-2 text-left"
                      >
                        <Avatar name={s.name} size={32} />
                        <span className="flex-1 truncate font-body text-sm font-semibold">{s.name}</span>
                        {s.position && <span className="text-xs font-bold text-fg-3">{s.position}</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-sunken px-3 py-4 text-center text-sm text-fg-3">
                    Nenhum aluno nesta turma ainda.
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button onClick={() => setEditing(true)}>Editar</Button>
                <Button variant="ghost" className="text-loss" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={18} /> Excluir turma
                </Button>
              </div>
            </>
          )
        )}
      </div>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir turma?">
        <p className="mb-5 font-body text-sm text-fg-2">
          Esta ação é irreversível. Os alunos não serão excluídos, apenas desvinculados desta turma.
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
