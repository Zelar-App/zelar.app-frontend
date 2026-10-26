import { CheckCircle2, Layers, Send, Settings, type LucideIcon } from 'lucide-react'
import type { Indicadores } from '../../../domain/types'
import { cn } from '../../../shared/lib/cn'

const CARDS: { chave: keyof Indicadores; rotulo: string; Icone: LucideIcon; cor: string }[] = [
  { chave: 'totalOcorrencias', rotulo: 'Total', Icone: Layers, cor: 'text-text border-border' },
  { chave: 'totalEnviadas', rotulo: 'Enviadas', Icone: Send, cor: 'text-primary border-primary/40 shadow-glow' },
  { chave: 'totalEmAnalise', rotulo: 'Em análise', Icone: Settings, cor: 'text-warning border-warning/40' },
  { chave: 'totalResolvidas', rotulo: 'Resolvidas', Icone: CheckCircle2, cor: 'text-success border-success/40 shadow-glow-success' },
]

export function IndicadoresCards({ indicadores }: { indicadores: Indicadores | null }) {
  return (
    <div className="grid grid-cols-2 gap-3 desktop:grid-cols-4">
      {CARDS.map(({ chave, rotulo, Icone, cor }) => (
        <section key={chave} aria-label={rotulo} className={cn('glass flex items-center gap-3 border p-4', cor)}>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface-strong">
            <Icone className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-text-muted">{rotulo}</p>
            <p className="text-2xl leading-none font-bold text-text">{indicadores ? indicadores[chave] : '–'}</p>
          </div>
        </section>
      ))}
    </div>
  )
}
