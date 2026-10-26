import { ChevronRight, Clock } from 'lucide-react'
import { Link } from 'react-router'

/** “Tempo de espera estimado” do mockup. */
export function EsperaCard({ diasRestantes }: { diasRestantes: number | null }) {
  const legenda = diasRestantes === 1 ? 'dia restante' : 'dias restantes'
  return (
    <section aria-label="Tempo de espera estimado" className="glass relative flex flex-col overflow-hidden p-4">
      <Link to="/historico" className="flex items-start justify-between gap-2">
        <h2 className="text-base leading-snug font-semibold">Tempo de espera estimado</h2>
        <ChevronRight className="mt-0.5 size-5 shrink-0 text-text-muted" aria-hidden="true" />
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/40 bg-primary-soft text-primary shadow-glow">
          <Clock className="size-6" aria-hidden="true" />
        </span>
        {diasRestantes === null ? (
          <p className="min-w-0 text-sm font-semibold text-text-muted">Sem chamados abertos</p>
        ) : (
          <p className="min-w-0 leading-tight">
            <span className="block text-3xl font-bold">{diasRestantes}</span>
            <span className="block text-sm font-medium text-text-muted">{diasRestantes === 0 ? 'prazo chegou' : legenda}</span>
          </p>
        )}
      </div>
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-primary/15" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40 C 40 10, 80 70, 120 35 S 180 20, 200 45 L200 60 L0 60 Z" fill="currentColor" />
      </svg>
    </section>
  )
}
