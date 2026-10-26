import type { Prioridade, StatusOcorrencia } from '../../domain/types'
import { rotuloPrioridade, rotuloStatus } from '../../domain/constantes'
import { Badge } from './Badge'
import { TOM_PRIORIDADE, TOM_STATUS } from './tons'

export function StatusBadge({ status, className }: { status: StatusOcorrencia; className?: string }) {
  return (
    <Badge tom={TOM_STATUS[status]} data-status={status} className={className}>
      {rotuloStatus(status)}
    </Badge>
  )
}

export function PrioridadeBadge({ prioridade, className }: { prioridade: Prioridade; className?: string }) {
  return (
    <Badge tom={TOM_PRIORIDADE[prioridade]} data-prioridade={prioridade} className={className}>
      Prioridade {rotuloPrioridade(prioridade).toLowerCase()}
    </Badge>
  )
}
