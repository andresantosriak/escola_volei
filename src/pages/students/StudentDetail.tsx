import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Trash2, TriangleAlert, Share2 } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Tabs } from '@/components/ui/tabs'
import { Field } from '@/components/ui/field'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { PlayerCard } from '@/components/students/PlayerCard'
import { PositionField } from '@/components/students/PositionField'
import { StatBadge } from '@/components/students/StatBadge'
import { studentSchema, type StudentInput } from '@/schemas/student-schema'
import { DOMINANT_HANDS, MIN_MATCHES_FOR_STATS, type PositionKey } from '@/lib/constants'
import { useStudent, useStudentMutations } from '@/hooks/use-students'
import { useClasses } from '@/hooks/use-classes'

const TAB_DADOS = 'Dados'
const TAB_DESEMPENHO = 'Desempenho'

export default function StudentDetail() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const { data: student, isLoading } = useStudent(isNew ? undefined : id)
  const { data: classes } = useClasses()
  const { create, update, remove } = useStudentMutations()

  const [tab, setTab] = useState(TAB_DADOS)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: { position: '', alternate_positions: [], dominant_hand: '', team_ids: [] },
  })

  useEffect(() => {
    if (student)
      reset({
        name: student.name,
        position: student.position as StudentInput['position'],
        alternate_positions: (student.alternate_positions as PositionKey[]) ?? [],
        age: student.age,
        height_cm: student.height_cm,
        dominant_hand: student.dominant_hand as StudentInput['dominant_hand'],
        guardian_name: student.guardian_name,
        guardian_phone: student.guardian_phone,
        notes: student.notes,
        team_ids: student.team_ids,
      })
  }, [student, reset])

  const onSubmit = async (data: StudentInput) => {
    try {
      if (isNew) {
        await create.mutateAsync(data)
        toast.success('Aluno cadastrado!')
        navigate('/students', { replace: true })
      } else {
        await update.mutateAsync({ id: id!, input: data, currentTeamIds: student?.team_ids ?? [] })
        toast.success('Aluno atualizado!')
      }
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const onDelete = async () => {
    try {
      await remove.mutateAsync(id!)
      toast.success('Aluno excluído.')
      navigate('/students', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
      setConfirmDelete(false)
    }
  }

  if (!isNew && isLoading) return <FullPageSpinner />
  const saving = create.isPending || update.isPending
  const classOptions = (classes ?? []).map((c) => ({ value: c.id, label: c.name }))
  const insufficient = !isNew && student && student.total_matches < MIN_MATCHES_FOR_STATS

  return (
    <>
      <Header title={isNew ? 'Novo aluno' : student?.name || 'Aluno'} back />
      <div className="p-4">
        {!isNew && (
          <Tabs tabs={[TAB_DADOS, TAB_DESEMPENHO]} active={tab} onChange={setTab} className="mb-4" />
        )}

        {(isNew || tab === TAB_DADOS) && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Nome *" error={errors.name?.message}>
              <Input placeholder="Bruno Almeida" {...register('name')} />
            </Field>

            <Controller
              control={control}
              name="position"
              render={({ field: posField }) => (
                <Controller
                  control={control}
                  name="alternate_positions"
                  render={({ field: altField }) => (
                    <PositionField
                      principal={posField.value as PositionKey | ''}
                      alternates={altField.value as PositionKey[]}
                      onPrincipalChange={posField.onChange}
                      onAlternatesChange={altField.onChange}
                    />
                  )}
                />
              )}
            />

            <div className="flex gap-3">
              <Field label="Idade" className="flex-1" error={errors.age?.message}>
                <Input type="number" inputMode="numeric" placeholder="16" {...register('age')} />
              </Field>
              <Field label="Altura (cm)" className="flex-1" error={errors.height_cm?.message}>
                <Input type="number" inputMode="numeric" placeholder="182" {...register('height_cm')} />
              </Field>
            </div>

            <Field label="Mão dominante">
              <Select
                placeholder="Não informado"
                options={DOMINANT_HANDS.map((h) => ({ value: h, label: h }))}
                {...register('dominant_hand')}
              />
            </Field>

            <Controller
              control={control}
              name="team_ids"
              render={({ field }) => (
                <Field label="Turmas">
                  <div className="flex flex-col gap-1.5">
                    {classOptions.length === 0 && (
                      <p className="text-sm text-fg-4">Nenhuma turma cadastrada.</p>
                    )}
                    {classOptions.map((c) => {
                      const checked = field.value?.includes(c.value)
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() =>
                            field.onChange(
                              checked
                                ? field.value.filter((v: string) => v !== c.value)
                                : [...(field.value ?? []), c.value],
                            )
                          }
                          className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                            checked
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-border-1 bg-surface text-fg-2'
                          }`}
                        >
                          <span
                            className={`flex size-4 items-center justify-center rounded border ${checked ? 'border-green-500 bg-green-500 text-white' : 'border-border-1'}`}
                          >
                            {checked && '✓'}
                          </span>
                          {c.label}
                        </button>
                      )
                    })}
                  </div>
                </Field>
              )}
            />

            <Field label="Responsável (LGPD — menores)">
              <Input placeholder="Nome do responsável" {...register('guardian_name')} />
            </Field>
            <Field label="Telefone do responsável">
              <Input placeholder="(11) 90000-0000" {...register('guardian_phone')} />
            </Field>
            <Field label="Observações">
              <Textarea placeholder="Notas sobre o aluno…" {...register('notes')} />
            </Field>

            <div className="mt-2 flex flex-col gap-2">
              <Button type="submit" full disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Button>
              {!isNew && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-loss"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={18} /> Excluir aluno
                </Button>
              )}
            </div>
          </form>
        )}

        {!isNew && tab === TAB_DESEMPENHO && student && (
          <div>
            <PlayerCard
              player={{
                name: student.name,
                position: student.position,
                overall: student.overall,
                age: student.age,
                heightCm: student.height_cm,
                dominantHand: student.dominant_hand,
                wins: student.wins,
                losses: student.losses,
                skills: student.skills,
                photoUrl: student.photo_url,
              }}
            />

            {insufficient ? (
              <div className="mt-4 flex items-start gap-3 rounded-lg bg-[#FFF0DD] p-4">
                <TriangleAlert size={20} className="mt-0.5 shrink-0 text-[#A85A00]" />
                <p className="font-body text-sm text-[#A85A00]">
                  Amostra insuficiente. Jogue mais treinos para liberar notas confiáveis (mínimo de{' '}
                  {MIN_MATCHES_FOR_STATS} partidas).
                </p>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                <StatBadge value={student.wins} label="Vitórias" tone="win" />
                <StatBadge value={student.losses} label="Derrotas" tone="loss" />
                <StatBadge value={student.total_matches} label="Partidas" tone="bal" />
              </div>
            )}

            <Button
              variant="secondary"
              full
              className="mt-4"
              onClick={() => navigate(`/share?student=${student.id}`)}
            >
              <Share2 size={18} /> Compartilhar card
            </Button>
          </div>
        )}
      </div>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir aluno?">
        <p className="mb-5 font-body text-sm text-fg-2">
          Esta ação é irreversível. Todo o histórico de avaliações e participações em partidas será
          removido.
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
