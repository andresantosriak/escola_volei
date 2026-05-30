import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/auth-service'
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth-schema'
import { AuthShell } from '@/components/auth/AuthShell'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true)
    try {
      await authService.updatePassword(data.password)
      toast.success('Senha atualizada!')
      navigate('/', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Nova senha" subtitle="Defina sua nova senha de acesso">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Nova senha" error={errors.password?.message} htmlFor="password">
          <Input id="password" type="password" autoComplete="new-password" placeholder="••••••" {...register('password')} />
        </Field>
        <Field label="Confirmar senha" error={errors.confirm?.message} htmlFor="confirm">
          <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••" {...register('confirm')} />
        </Field>
        <Button type="submit" full size="lg" disabled={loading}>
          {loading ? <Spinner className="text-white" /> : 'Salvar nova senha'}
        </Button>
      </form>
    </AuthShell>
  )
}
