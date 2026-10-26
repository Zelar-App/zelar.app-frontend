import { Outlet } from 'react-router'
import { TabBar } from './TabBar'

/** Casca responsiva do app do cidadão, sem navegação lateral. */
export function AppShell() {
  return (
    <div className="min-h-dvh">
      <main className="mx-auto min-h-dvh w-full max-w-[1440px] pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
