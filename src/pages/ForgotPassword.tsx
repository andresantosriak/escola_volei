import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/auth-service'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth-schema'
import { AuthShell } from '@/components/auth/AuthShell'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true)
    try {
      await authService.resetPasswordForEmail(data.email)
      setSent(true)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Enviaremos um link para redefinir sua senha"
      footer={
        <Link to="/login" className="font-semibold text-green-600">
          Voltar ao login
        </Link>
      }
    >
      {sent ? (
        <p className="rounded-lg bg-green-50 p-4 text-center font-body text-sm text-green-700">
          Se este e-mail estiver cadastrado, você receberá um link de recuperação em instantes.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="E-mail" error={errors.email?.message} htmlFor="email">
            <Input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" {...register('email')} />
          </Field>
          <Button type="submit" full size="lg" disabled={loading}>
            {loading ? <Spinner className="text-white" /> : 'Enviar link'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
