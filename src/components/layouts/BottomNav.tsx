import { useEffect, useRef } from 'react'
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
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () =>
      document.documentElement.style.setProperty(
        '--bottom-nav-h',
        el.offsetHeight + 'px',
      )
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <nav
      ref={ref}
      className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[440px] -translate-x-1/2 border-t border-border-1 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      {TABS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-[3px] pt-1 pb-2 font-body text-[10.5px] font-bold transition-colors',
              isActive ? 'text-green-600' : 'text-fg-4',
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
