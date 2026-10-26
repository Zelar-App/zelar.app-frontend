import { ArrowLeft, ClipboardList } from 'lucide-react'
import { Link, Outlet } from 'react-router'

/** Casca do painel administrativo: mais larga, sem tab bar. */
export function AdminShell() {
  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-bg-elevated/90 p-5 backdrop-blur-xl desktop:flex">
        <img src="/assets/logo-zelar.png" alt="Zelar App" className="h-auto w-40" />
        <p className="mt-4 text-xs font-semibold tracking-wide text-text-muted uppercase">Painel administrativo</p>
        <nav aria-label="Navegação administrativa" className="mt-8">
          <Link to="/admin" className="flex items-center gap-3 rounded-field bg-primary-soft px-4 py-3 font-semibold text-primary">
            <ClipboardList className="size-5" aria-hidden="true" />
            Ocorrências
          </Link>
        </nav>
        <Link to="/" className="mt-auto flex items-center gap-2 rounded-field px-4 py-3 text-sm text-text-muted hover:bg-surface hover:text-text">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar ao app
        </Link>
      </aside>

      <div className="min-h-dvh desktop:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-bg-elevated/85 backdrop-blur-xl desktop:hidden">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 md:px-6">
            <img src="/assets/logo-zelar.png" alt="Zelar App" className="h-6 w-auto shrink-0 sm:h-8" />
            <h1 className="text-base font-semibold">Painel administrativo</h1>
            <Link to="/" className="ml-auto shrink-0 text-sm text-text-muted hover:text-text">
              Voltar ao app
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 md:py-8 desktop:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
