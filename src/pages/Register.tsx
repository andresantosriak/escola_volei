import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/auth-service'
import { registerSchema, type RegisterInput } from '@/schemas/auth-schema'
import { AuthShell } from '@/components/auth/AuthShell'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    try {
      await authService.signUp(data)
      toast.success('Conta criada! Você já pode começar.')
      navigate('/', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Comece a montar seus times em minutos"
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-green-600">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Seu nome" error={errors.fullName?.message} htmlFor="fullName">
          <Input id="fullName" autoComplete="name" placeholder="Téc. Marcos Lima" {...register('fullName')} />
        </Field>
        <Field label="E-mail" error={errors.email?.message} htmlFor="email">
          <Input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" {...register('email')} />
        </Field>
        <Field label="Senha" error={errors.password?.message} hint="Mínimo de 6 caracteres" htmlFor="password">
          <Input id="password" type="password" autoComplete="new-password" placeholder="••••••" {...register('password')} />
        </Field>
        <Button type="submit" full size="lg" disabled={loading}>
          {loading ? <Spinner className="text-white" /> : 'Criar conta'}
        </Button>
      </form>
    </AuthShell>
  )
}
