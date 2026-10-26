import { ChevronRight, Inbox } from 'lucide-react'
import { Link } from 'react-router'
import { formatarHora } from '../../../shared/lib/datas'
import { cn } from '../../../shared/lib/cn'
import { ICONE_STATUS } from '../../ocorrencias/icones'
import type { MensagemCaixa } from '../caixaDeEntrada'

const COR_ICONE = {
  ENVIADA: 'border-primary/50 bg-primary-soft text-primary',
  EM_ANALISE: 'border-primary/50 bg-primary-soft text-primary',
  RESOLVIDA: 'border-success/50 bg-success text-bg shadow-glow-success',
} as const

export function ListaCaixaEntrada({ mensagens, compacta = false }: { mensagens: MensagemCaixa[]; compacta?: boolean }) {
  if (mensagens.length === 0) {
    return (
      <p className="flex items-center gap-2 py-4 text-sm text-text-muted">
        <Inbox className="size-5" aria-hidden="true" /> Nenhuma mensagem ainda. Abra um chamado para começar.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {mensagens.map((m) => {
        const Icone = ICONE_STATUS[m.status]
        return (
          <li key={`${m.ocorrenciaId}-${m.status}-${m.data}`}>
            <Link to={`/historico/${m.ocorrenciaId}`} className="flex items-center gap-3">
              <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full border', COR_ICONE[m.status])}>
                <Icone className="size-5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 items-center rounded-2xl rounded-tl-sm border border-border bg-surface/70 px-3 py-2.5 text-sm">
                <span className={compacta ? 'line-clamp-2' : undefined}>{m.mensagem}</span>
              </span>
              <time dateTime={m.data} className="shrink-0 text-xs text-text-dim">
                {formatarHora(m.data)}
              </time>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** “Caixa de entrada” do mockup: últimas mensagens de status. */
export function CaixaEntradaCard({ mensagens, aoAbrir }: { mensagens: MensagemCaixa[]; aoAbrir: () => void }) {
  return (
    <section aria-label="Caixa de entrada" className="glass p-4">
      <button type="button" onClick={aoAbrir} className="flex w-full items-center justify-between gap-2 text-left">
        <h2 className="text-base font-semibold">Caixa de entrada</h2>
        <ChevronRight className="size-5 shrink-0 text-text-muted" aria-hidden="true" />
      </button>
      <div className="mt-3">
        <ListaCaixaEntrada mensagens={mensagens} compacta />
      </div>
    </section>
  )
}
