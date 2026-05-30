import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/auth-service'
import { loginSchema, type LoginInput } from '@/schemas/auth-schema'
import { AuthShell } from '@/components/auth/AuthShell'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    try {
      await authService.signIn(data)
      navigate('/', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Esporte Recreação"
      subtitle="Entre para gerenciar suas turmas"
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/register" className="font-semibold text-green-600">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="E-mail" error={errors.email?.message} htmlFor="email">
          <Input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" {...register('email')} />
        </Field>
        <Field label="Senha" error={errors.password?.message} htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••" {...register('password')} />
        </Field>
        <div className="mb-4 text-right">
          <Link to="/forgot-password" className="font-body text-sm font-semibold text-green-600">
            Esqueci a senha
          </Link>
        </div>
        <Button type="submit" full size="lg" disabled={loading}>
          {loading ? <Spinner className="text-white" /> : 'Entrar'}
        </Button>
      </form>
    </AuthShell>
  )
}
