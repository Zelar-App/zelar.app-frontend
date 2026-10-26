import type { HistoricoStatus, StatusOcorrencia } from '../../../domain/types'
import { rotuloStatus } from '../../../domain/constantes'
import { cn } from '../../../shared/lib/cn'
import { formatarDataHora } from '../../../shared/lib/datas'
import { ICONE_STATUS } from '../icones'

const COR_ICONE: Record<StatusOcorrencia, string> = {
  ENVIADA: 'border-primary/50 bg-primary-soft text-primary',
  EM_ANALISE: 'border-warning/50 bg-warning-soft text-warning',
  RESOLVIDA: 'border-success/50 bg-success text-bg shadow-glow-success',
}

export function TimelineStatus({ historico }: { historico: HistoricoStatus[] }) {
  const itens = [...historico].sort((a, b) => (a.data < b.data ? -1 : 1))
  return (
    <ol className="relative flex flex-col gap-4 pl-2">
      {itens.map((h, i) => {
        const Icone = ICONE_STATUS[h.status]
        const ultimo = i === itens.length - 1
        return (
          <li key={`${h.status}-${h.data}`} className="relative flex gap-3">
            {!ultimo && <span className="absolute top-10 bottom-[-1rem] left-[19px] w-px bg-border-strong" aria-hidden="true" />}
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full border', COR_ICONE[h.status])}>
              <Icone className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-semibold">{rotuloStatus(h.status)}</p>
              <p className="text-sm text-text-muted">{h.mensagem}</p>
              <p className="mt-0.5 text-xs text-text-dim">{formatarDataHora(h.data)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
