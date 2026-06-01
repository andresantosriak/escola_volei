import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Camera,
  ChevronLeft,
  Share2,
  Trash2,
  TriangleAlert,
  Trophy,
  UserCheck,
} from 'lucide-react'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Tabs } from '@/components/ui/tabs'
import { Field } from '@/components/ui/field'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { PlayerCard } from '@/components/students/PlayerCard'
import { Avatar } from '@/components/students/Avatar'
import { PositionField } from '@/components/students/PositionField'
import { StatBadge } from '@/components/students/StatBadge'
import { studentSchema, type StudentInput } from '@/schemas/student-schema'
import { DOMINANT_HANDS, MIN_MATCHES_FOR_STATS, type PositionKey } from '@/lib/constants'
import { useStudent, useStudentMutations } from '@/hooks/use-students'
import { useClasses } from '@/hooks/use-classes'

const TAB_DADOS = 'Dados'
const TAB_DESEMPENHO = 'Desempenho'

/* ---------- Evolution mini chart ---------- */
function EvolutionChart({ values }: { values: number[] }) {
  if (values.length === 0) return null
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = Math.max(maxVal - minVal, 10)

  return (
    <div
      className="rounded-[18px] bg-surface p-4 shadow-sm"
      style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}
    >
      {values.map((v, i) => (
        <div
          key={i}
          className="flex flex-1 flex-col items-center"
          style={{ gap: 6 }}
        >
          <div
            style={{
              width: '100%',
              height: `${Math.max(((v - minVal + 4) / (range + 8)) * 76, 8)}px`,
              background:
                i === values.length - 1
                  ? 'var(--color-green-500)'
                  : 'var(--color-green-200)',
              borderRadius: 6,
            }}
          />
          <span className="font-num text-[10px] font-bold text-fg-4">{v}</span>
        </div>
      ))}
    </div>
  )
}

/* ================================================================ */
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

  /* ---------- derived stats for Desempenho ---------- */
  const totalMatches = student ? student.wins + student.losses : 0
  const approvalPct = totalMatches > 0 ? Math.round((student!.wins / totalMatches) * 100) : 0

  // Placeholder evolution data (would come from evaluation history when available)
  const evolutionValues = student
    ? [62, 64, 63, 68, 72, 70, student.overall]
    : []

  return (
    <>
      {/* ---- Dark header area (ink-800) ---- */}
      <div className="bg-ink-800">
        {/* Header row */}
        <header className="flex items-center gap-2 px-[18px] pb-3 pt-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="flex size-[40px] shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: 'rgba(255,255,255,.12)' }}
          >
            <ChevronLeft size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[20px] font-extrabold text-white">
              Perfil do aluno
            </h1>
          </div>
          {!isNew && student && (
            <button
              type="button"
              onClick={() => navigate(`/share?student=${student.id}`)}
              aria-label="Compartilhar"
              className="flex size-[40px] shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: 'rgba(255,255,255,.12)' }}
            >
              <Share2 size={19} />
            </button>
          )}
        </header>

        {/* Tabs inside dark area */}
        {!isNew && (
          <div className="px-[18px] pb-[14px]">
            <Tabs tabs={[TAB_DADOS, TAB_DESEMPENHO]} active={tab} onChange={setTab} />
          </div>
        )}
      </div>

      {/* ---- Desempenho tab ---- */}
      {!isNew && tab === TAB_DESEMPENHO && student && (
        <>
          {/* PlayerCard in dark container */}
          <div className="bg-ink-800 px-[18px] pb-[22px]">
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
          </div>

          {/* Light content area */}
          <div className="px-[18px] pt-[18px] pb-6">
            {insufficient ? (
              <div className="flex items-start gap-3 rounded-[18px] bg-surface p-4 shadow-sm">
                <TriangleAlert size={20} className="mt-0.5 shrink-0 text-warn" />
                <p className="font-body text-[13.5px] leading-[1.45] text-fg-2">
                  <b>Amostra insuficiente.</b> Jogue mais treinos para liberar notas
                  confiáveis (mínimo de {MIN_MATCHES_FOR_STATS} partidas).
                </p>
              </div>
            ) : (
              <>
                {/* Stat badges row */}
                <div className="flex flex-wrap gap-[9px]">
                  <StatBadge
                    value={`${student.wins}V`}
                    label="vitórias"
                    tone="win"
                    icon={Trophy}
                  />
                  <StatBadge
                    value={`${student.losses}D`}
                    label="derrotas"
                    tone="loss"
                  />
                  <StatBadge
                    value={`${approvalPct}%`}
                    label="aproveit."
                    tone="bal"
                  />
                  <StatBadge
                    value="89%"
                    label="presença"
                    tone="neutral"
                    icon={UserCheck}
                  />
                </div>

                {/* Evolution section */}
                <div className="mt-6 flex items-baseline justify-between">
                  <h3 className="q-label">
                    Evolução · {evolutionValues.length} treinos
                  </h3>
                </div>
                <div className="mt-3">
                  <EvolutionChart values={evolutionValues} />
                </div>

                {/* Recent matches */}
                <div className="mt-6 flex items-baseline justify-between">
                  <h3 className="q-label">Partidas recentes</h3>
                  <button
                    type="button"
                    onClick={() => navigate('/history')}
                    className="font-body text-[13px] font-semibold text-green-500"
                  >
                    Ver tudo
                  </button>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {/* Placeholder — would use student-specific match history */}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ---- Dados tab (or new student) ---- */}
      {(isNew || tab === TAB_DADOS) && (
        <div className="px-[18px] pt-[18px] pb-6">
          {/* Avatar + change photo */}
          {!isNew && student && (
            <div className="mb-5 flex items-center gap-[14px]">
              <Avatar
                name={student.name}
                size={64}
                photoUrl={student.photo_url}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  /* photo change — future */
                }}
              >
                <Camera size={18} /> Trocar foto
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field error={errors.name?.message}>
              <span className="q-label mb-1.5 block">Nome completo</span>
              <Input placeholder="Bruno Almeida" {...register('name')} />
            </Field>

            <div className="flex gap-3">
              <Field className="flex-1" error={errors.age?.message}>
                <span className="q-label mb-1.5 block">Idade</span>
                <Input type="number" inputMode="numeric" placeholder="16" {...register('age')} />
              </Field>
              <Field className="flex-1" error={errors.height_cm?.message}>
                <span className="q-label mb-1.5 block">Altura (cm)</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="182"
                  {...register('height_cm')}
                />
              </Field>
            </div>

            <Field>
              <span className="q-label mb-1.5 block">Mão dominante</span>
              <Select
                placeholder="Não informado"
                options={DOMINANT_HANDS.map((h) => ({ value: h, label: h }))}
                {...register('dominant_hand')}
              />
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

            <Controller
              control={control}
              name="team_ids"
              render={({ field }) => (
                <Field>
                  <span className="q-label mb-1.5 block">Turma(s)</span>
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

            <Field>
              <span className="q-label mb-1.5 block">Responsável (LGPD — menores)</span>
              <Input placeholder="Nome do responsável" {...register('guardian_name')} />
            </Field>
            <Field>
              <span className="q-label mb-1.5 block">Telefone do responsável</span>
              <Input placeholder="(11) 90000-0000" {...register('guardian_phone')} />
            </Field>
            <Field>
              <span className="q-label mb-1.5 block">Observações</span>
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
        </div>
      )}

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
