import { FileText, Home, Map, User, Zap } from 'lucide-react'
import { NavLink } from 'react-router'
import { cn } from '../lib/cn'

const ABAS = [
  { para: '/', rotulo: 'Início', Icone: Home, exato: true },
  { para: '/mapa', rotulo: 'Mapa', Icone: Map },
  { para: '/abrir-chamado', rotulo: 'Abrir Chamado', Icone: Zap },
  { para: '/historico', rotulo: 'Histórico', Icone: FileText },
  { para: '/conta', rotulo: 'Conta', Icone: User },
] as const

export function TabBar() {
  return (
    <nav
      aria-label="Navegação principal"
      className="safe-bottom fixed inset-x-0 bottom-0 z-[1100] border-t border-border bg-bg-elevated/85 backdrop-blur-xl"
    >
      <ul className="mx-auto flex h-tabbar w-full max-w-md items-stretch justify-between px-2 md:max-w-2xl">
        {ABAS.map(({ para, rotulo, Icone, ...resto }) => (
          <li key={para} className="flex flex-1 items-center justify-center">
            <NavLink
              to={para}
              end={'exato' in resto && resto.exato}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium transition-colors',
                  isActive ? 'bg-primary text-bg shadow-glow-strong' : 'text-text-muted hover:text-text',
                )
              }
            >
              <Icone className="size-6" strokeWidth={1.75} aria-hidden="true" />
              <span className="whitespace-nowrap">{rotulo}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
