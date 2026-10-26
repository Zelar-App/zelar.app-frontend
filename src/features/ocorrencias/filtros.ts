import type { StatusOcorrencia } from '../../domain/types'

export const FILTROS_STATUS: { valor: StatusOcorrencia | null; rotulo: string }[] = [
  { valor: null, rotulo: 'Todas' },
  { valor: 'ENVIADA', rotulo: 'Enviadas' },
  { valor: 'EM_ANALISE', rotulo: 'Em análise' },
  { valor: 'RESOLVIDA', rotulo: 'Resolvidas' },
]
