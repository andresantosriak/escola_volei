import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-app">
      <main className="flex-1 pb-2">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

/** Layout de foco — agora também exibe BottomNav (fixed) */
export function FocusLayout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-app">
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
