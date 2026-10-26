import { CheckCircle2, ChevronRight, FileText } from 'lucide-react'
import { Link } from 'react-router'

/** “Chamados Abertos e Resolvidos” do mockup. */
export function ResumoCard({ abertos, resolvidos }: { abertos: number; resolvidos: number }) {
  return (
    <section aria-label="Chamados Abertos e Resolvidos" className="glass flex flex-col p-4">
      <Link to="/historico" className="flex items-start justify-between gap-2">
        <h2 className="text-base leading-snug font-semibold">Chamados Abertos e Resolvidos</h2>
        <ChevronRight className="mt-0.5 size-5 shrink-0 text-text-muted" aria-hidden="true" />
      </Link>
      <dl className="mt-4 flex flex-col divide-y divide-border">
        <div className="flex items-center gap-3 pb-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/40 bg-primary-soft text-primary shadow-glow">
            <FileText className="size-6" aria-hidden="true" />
          </span>
          <div>
            <dt className="text-sm text-text-muted">Abertos:</dt>
            <dd className="text-3xl leading-none font-bold">{abertos}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-success/40 bg-success-soft text-success shadow-glow-success">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <div>
            <dt className="text-sm text-text-muted">Resolvidos:</dt>
            <dd className="text-3xl leading-none font-bold">{resolvidos}</dd>
          </div>
        </div>
      </dl>
    </section>
  )
}
