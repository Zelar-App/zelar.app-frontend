import { ChevronRight, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import type { Ocorrencia } from '../../../domain/types'
import { rotuloCategoria } from '../../../domain/constantes'
import { formatarData } from '../../../shared/lib/datas'
import { PrioridadeBadge, StatusBadge } from '../../../shared/ui'
import { ICONE_CATEGORIA } from '../icones'

export function OcorrenciaListItem({ ocorrencia, href }: { ocorrencia: Ocorrencia; href: string }) {
  const Icone = ICONE_CATEGORIA[ocorrencia.categoria]
  return (
    <li>
      <Link to={href} className="glass flex items-center gap-3 p-3 transition-colors hover:border-border-strong">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-strong text-primary">
          <Icone className="size-6" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold">{rotuloCategoria(ocorrencia.categoria)}</span>
            <span className="shrink-0 text-xs text-text-dim">{formatarData(ocorrencia.criadoEm)}</span>
          </span>
          <span className="mt-0.5 line-clamp-1 text-sm text-text-muted">{ocorrencia.descricao}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={ocorrencia.status} />
            {ocorrencia.prioridade && <PrioridadeBadge prioridade={ocorrencia.prioridade} />}
            {ocorrencia.localizacao.enderecoAproximado && (
              <span className="flex min-w-0 items-center gap-1 text-xs text-text-dim">
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{ocorrencia.localizacao.enderecoAproximado}</span>
              </span>
            )}
          </span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-text-dim" aria-hidden="true" />
      </Link>
    </li>
  )
}
