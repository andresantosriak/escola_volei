import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Archive,
  ArchiveRestore,
  Building2,
  Lock,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Trash2,
  User,
  UsersRound,
} from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { FullPageSpinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/layouts/EmptyState'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { InfoRow } from '@/components/manage/InfoRow'
import { ListRow } from '@/components/manage/ListRow'
import { branchSchema, type BranchInput } from '@/schemas/branch-schema'
import { useBranch, useBranchMutations } from '@/hooks/use-branches'
import { useClasses } from '@/hooks/use-classes'
import { branchService } from '@/services/branch-service'

export default function BranchDetail() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const { data: branch, isLoading } = useBranch(isNew ? undefined : id)
  const { data: classes } = useClasses(isNew ? undefined : id)
  const { create, update, setArchived, remove } = useBranchMutations()

  const [editing, setEditing] = useState(isNew)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchInput>({ resolver: zodResolver(branchSchema) })

  useEffect(() => {
    if (branch) reset(branch)
  }, [branch, reset])

  const onSubmit = async (data: BranchInput) => {
    try {
      if (isNew) {
        await create.mutateAsync(data)
        toast.success('Filial criada!')
        navigate('/manage/branches', { replace: true })
      } else {
        await update.mutateAsync({ id: id!, input: data })
        toast.success('Filial atualizada!')
        setEditing(false)
      }
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const onDelete = async () => {
    try {
      const count = await branchService.activeTeamCount(id!)
      if (count > 0) {
        toast.error(`Esta filial tem ${count} turma(s) ativa(s). Arquive-as antes de excluir.`)
        setConfirmDelete(false)
        return
      }
      await remove.mutateAsync(id!)
      toast.success('Filial excluída.')
      navigate('/manage/branches', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
      setConfirmDelete(false)
    }
  }

  if (!isNew && isLoading) return <FullPageSpinner />

  const saving = create.isPending || update.isPending
  const turmas = classes ?? []
  const hasTurmas = turmas.length > 0

  /* ---- right header element ---- */
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
        title={isNew ? 'Nova filial' : branch?.name || 'Filial'}
        back
        right={headerRight}
      />

      <div className="px-[18px] pb-8">
        {editing ? (
          /* ---- EDIT / NEW MODE ---- */
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Nome da filial *" error={errors.name?.message}>
              <Input placeholder="Ex.: Unidade Centro" {...register('name')} />
            </Field>
            <Field label="Cidade / região">
              <Input placeholder="Ex.: São Paulo · Centro" {...register('city')} />
            </Field>
            <Field label="Endereço · opcional">
              <Input placeholder="Rua, número" {...register('address')} />
            </Field>
            <Field label="Telefone · opcional">
              <Input placeholder="(11) 0000-0000" {...register('phone')} />
            </Field>
            <Field label="Responsável · opcional">
              <Input placeholder="Nome" {...register('manager_name')} />
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
          branch && (
            <>
              {/* ---- INFO CARD ---- */}
              <div className="rounded-[18px] bg-surface px-4 shadow-sm">
                <InfoRow icon={Building2} label="Nome" value={branch.name} />
                <InfoRow icon={MapPin} label="Cidade / região" value={branch.city} />
                <InfoRow icon={Navigation} label="Endereço" value={branch.address} />
                <InfoRow icon={Phone} label="Telefone" value={branch.phone} />
                <InfoRow icon={User} label="Responsável" value={branch.manager_name} />
              </div>

              {/* ---- TURMAS SECTION ---- */}
              <h2 className="mb-2.5 mt-6 font-display text-[15px] font-extrabold text-fg-1">
                Turmas desta filial{' '}
                <span className="font-body font-semibold text-fg-3">&middot; {turmas.length}</span>
              </h2>

              {hasTurmas ? (
                <>
                  <div className="flex flex-col gap-2.5">
                    {turmas.map((t) => {
                      const parts = [
                        t.schedule_days,
                        t.schedule_time?.slice(0, 5),
                        `${t.student_count} alunos`,
                      ].filter(Boolean)
                      return (
                        <ListRow
                          key={t.id}
                          title={t.name}
                          subtitle={parts.join(' · ')}
                          leadingIcon={UsersRound}
                          onClick={() => navigate(`/manage/classes/${t.id}`)}
                        />
                      )
                    })}
                  </div>

                  <Button
                    variant="secondary"
                    full
                    className="mt-3"
                    onClick={() => navigate(`/manage/classes/new?branch=${id}`)}
                  >
                    <Plus size={18} />
                    Nova turma
                  </Button>
                </>
              ) : (
                <EmptyState
                  icon={UsersRound}
                  title="Nenhuma turma nesta filial"
                  description="Crie a primeira turma para começar a usar esta unidade."
                  ctaLabel="Adicionar primeira turma"
                  onCta={() => navigate(`/manage/classes/new?branch=${id}`)}
                />
              )}

              {/* ---- ACOES SECTION ---- */}
              <h2 className="mb-2.5 mt-6 font-display text-[15px] font-extrabold text-fg-1">
                Ações
              </h2>

              <div className="flex flex-col gap-2.5">
                <Button
                  variant="ghost"
                  full
                  onClick={() =>
                    setArchived.mutate(
                      { id: branch.id, archived: !branch.archived },
                      {
                        onSuccess: () =>
                          toast.success(branch.archived ? 'Reativada.' : 'Arquivada.'),
                      },
                    )
                  }
                >
                  {branch.archived ? (
                    <ArchiveRestore size={18} />
                  ) : (
                    <Archive size={18} />
                  )}
                  {branch.archived ? 'Reativar filial' : 'Arquivar filial'}
                </Button>

                <button
                  type="button"
                  onClick={() =>
                    hasTurmas
                      ? toast.error('Mova ou arquive as turmas primeiro')
                      : setConfirmDelete(true)
                  }
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-border-2 bg-transparent px-[18px] py-3 font-display text-[15px] font-bold transition-all active:scale-[0.97] ${
                    hasTurmas ? 'text-fg-4' : 'text-loss'
                  }`}
                >
                  <Trash2 size={18} />
                  Excluir filial
                </button>
              </div>

              {hasTurmas && (
                <p className="mt-3 flex items-start gap-1.5 px-0.5 text-[11.5px] leading-snug text-fg-4">
                  <Lock size={13} className="mt-0.5 shrink-0" />
                  Filiais com turmas ativas não podem ser excluídas — arquive ou mova as turmas
                  antes.
                </p>
              )}
            </>
          )
        )}
      </div>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir filial?">
        <p className="mb-5 font-body text-sm text-fg-2">
          Esta ação é irreversível. Filiais com turmas ativas não podem ser excluídas — arquive-as
          antes.
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
