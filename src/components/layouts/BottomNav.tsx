import { Home, History, Users, Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/', icon: Home, label: 'Início', end: true },
  { to: '/history', icon: History, label: 'Histórico', end: false },
  { to: '/students', icon: Users, label: 'Alunos', end: false },
  { to: '/menu', icon: Menu, label: 'Menu', end: false },
]

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 flex border-t border-border-1 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {TABS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 font-body text-[11px] font-semibold transition-colors',
              isActive ? 'text-green-600' : 'text-fg-3',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={23} strokeWidth={isActive ? 2.4 : 2} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
