import { useId } from 'react'
import type { Prioridade, StatusOcorrencia } from '../../../domain/types'
import { PRIORIDADES, rotuloPrioridade } from '../../../domain/constantes'
import { Chip } from '../../../shared/ui'
import { CLASSE_CAMPO } from '../../../shared/ui/Input'
import { FILTROS_STATUS } from '../../ocorrencias/filtros'

export interface FiltrosOcorrenciaProps {
  status: StatusOcorrencia | null
  prioridade: Prioridade | null
  aoMudarStatus: (s: StatusOcorrencia | null) => void
  aoMudarPrioridade: (p: Prioridade | null) => void
}

export function FiltrosOcorrencia({ status, prioridade, aoMudarStatus, aoMudarPrioridade }: FiltrosOcorrenciaProps) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Filtrar por status">
        {FILTROS_STATUS.map((f) => (
          <Chip key={f.rotulo} selecionado={status === f.valor} onClick={() => aoMudarStatus(f.valor)}>
            {f.rotulo}
          </Chip>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="shrink-0 text-sm text-text-muted">
          Prioridade
        </label>
        <select
          id={id}
          value={prioridade ?? ''}
          onChange={(e) => aoMudarPrioridade((e.target.value || null) as Prioridade | null)}
          className={`${CLASSE_CAMPO} h-10 w-full md:w-44`}
        >
          <option value="">Todas</option>
          {PRIORIDADES.map((p) => (
            <option key={p} value={p}>
              {rotuloPrioridade(p)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
