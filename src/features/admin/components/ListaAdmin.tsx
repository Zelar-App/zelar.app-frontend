import { ExternalLink, MapPin, Settings2 } from 'lucide-react'
import { Link } from 'react-router'
import type { Ocorrencia } from '../../../domain/types'
import { rotuloCategoria } from '../../../domain/constantes'
import { formatarDataHora } from '../../../shared/lib/datas'
import { Button, PrioridadeBadge, StatusBadge } from '../../../shared/ui'
import { ICONE_CATEGORIA } from '../../ocorrencias/icones'

export function ListaAdmin({ lista, aoGerenciar }: { lista: Ocorrencia[]; aoGerenciar: (o: Ocorrencia) => void }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2 desktop:grid-cols-1" aria-label="Ocorrências">
      {lista.map((o) => {
        const Icone = ICONE_CATEGORIA[o.categoria]
        return (
          <li key={o.id} className="glass flex min-w-0 flex-col gap-3 p-4 desktop:flex-row desktop:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface-strong text-primary">
                <Icone className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="font-semibold">{rotuloCategoria(o.categoria)}</p>
                  <StatusBadge status={o.status} />
                  {o.prioridade && <PrioridadeBadge prioridade={o.prioridade} />}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-text-muted">{o.descricao}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-dim">
                  <span>{formatarDataHora(o.criadoEm)}</span>
                  {o.localizacao.enderecoAproximado && (
                    <span className="flex min-w-0 items-center gap-1">
                      <MapPin className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{o.localizacao.enderecoAproximado}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link to={`/historico/${o.id}`} className="flex-1 desktop:flex-none">
                <Button variante="secundaria" tamanho="sm" larguraTotal icone={<ExternalLink className="size-4" aria-hidden="true" />}>
                  Detalhe
                </Button>
              </Link>
              <Button tamanho="sm" className="flex-1 desktop:flex-none" onClick={() => aoGerenciar(o)} icone={<Settings2 className="size-4" aria-hidden="true" />}>
                Gerenciar
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
