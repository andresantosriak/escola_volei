import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { InfoRow } from '@/components/manage/InfoRow'
import { branchSchema, type BranchInput } from '@/schemas/branch-schema'
import { useBranch, useBranchMutations } from '@/hooks/use-branches'
import { branchService } from '@/services/branch-service'

export default function BranchDetail() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const { data: branch, isLoading } = useBranch(isNew ? undefined : id)
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

  return (
    <>
      <Header title={isNew ? 'Nova filial' : branch?.name || 'Filial'} back />
      <div className="p-4">
        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Nome *" error={errors.name?.message}>
              <Input placeholder="Unidade Centro" {...register('name')} />
            </Field>
            <Field label="Cidade">
              <Input placeholder="São Paulo · Centro" {...register('city')} />
            </Field>
            <Field label="Endereço">
              <Input placeholder="Rua das Quadras, 120" {...register('address')} />
            </Field>
            <Field label="Telefone">
              <Input placeholder="(11) 3344-1200" {...register('phone')} />
            </Field>
            <Field label="Responsável">
              <Input placeholder="Téc. Marcos Lima" {...register('manager_name')} />
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
          branch && (
            <>
              <div className="rounded-lg border border-border-1 bg-surface px-4 py-1">
                <InfoRow label="Nome" value={branch.name} />
                <InfoRow label="Cidade" value={branch.city} />
                <InfoRow label="Endereço" value={branch.address} />
                <InfoRow label="Telefone" value={branch.phone} />
                <InfoRow label="Responsável" value={branch.manager_name} />
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button onClick={() => setEditing(true)}>Editar</Button>
                <Button
                  variant="secondary"
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
                  {branch.archived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                  {branch.archived ? 'Reativar' : 'Arquivar'}
                </Button>
                <Button variant="ghost" className="text-loss" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={18} /> Excluir
                </Button>
              </div>
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
