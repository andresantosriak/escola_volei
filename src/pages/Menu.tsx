import { Building2, Users, Sliders, Settings as SettingsIcon, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Header } from '@/components/layouts/Header'
import { ListRow } from '@/components/manage/ListRow'
import { authService } from '@/services/auth-service'

const ITEMS = [
  { to: '/manage/branches', icon: Building2, title: 'Filiais', subtitle: 'Unidades e endereços' },
  { to: '/manage/classes', icon: Users, title: 'Turmas', subtitle: 'Horários e níveis' },
  { to: '/manage/skills', icon: Sliders, title: 'Fundamentos', subtitle: 'O que entra na avaliação' },
  { to: '/manage/settings', icon: SettingsIcon, title: 'Configurações', subtitle: 'Conta, tema e preferências' },
]

export default function Menu() {
  const navigate = useNavigate()
  const logout = async () => {
    try {
      await authService.signOut()
      navigate('/login', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  return (
    <>
      <Header title="Menu" subtitle="Gerenciamento" />
      <div className="flex flex-col gap-2.5 p-4">
        {ITEMS.map(({ to, icon: Icon, title, subtitle }) => (
          <ListRow
            key={to}
            title={title}
            subtitle={subtitle}
            onClick={() => navigate(to)}
            leading={
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 text-green-500">
                <Icon size={20} />
              </div>
            }
          />
        ))}
        <button
          type="button"
          onClick={logout}
          className="mt-3 flex items-center justify-center gap-2 rounded-lg py-3 font-body text-sm font-semibold text-loss"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </>
  )
}
