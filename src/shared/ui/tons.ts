import type { Prioridade, StatusOcorrencia } from '../../domain/types'
import type { TomBadge } from './Badge'

export const TOM_STATUS: Record<StatusOcorrencia, TomBadge> = {
  ENVIADA: 'primario',
  EM_ANALISE: 'alerta',
  RESOLVIDA: 'sucesso',
}

export const TOM_PRIORIDADE: Record<Prioridade, TomBadge> = {
  BAIXA: 'neutro',
  MEDIA: 'alerta',
  ALTA: 'perigo',
}

/** Cor hex de cada status (pins do mapa, SVGs). */
export const COR_STATUS: Record<StatusOcorrencia, string> = {
  ENVIADA: '#00d4ff',
  EM_ANALISE: '#ff9f1c',
  RESOLVIDA: '#1be7a6',
}
