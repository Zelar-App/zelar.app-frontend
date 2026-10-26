import type { StatusOcorrencia } from '../types'

const PROXIMO: Record<StatusOcorrencia, StatusOcorrencia | null> = {
  ENVIADA: 'EM_ANALISE',
  EM_ANALISE: 'RESOLVIDA',
  RESOLVIDA: null,
}

export function proximoStatus(atual: StatusOcorrencia): StatusOcorrencia | null {
  return PROXIMO[atual]
}

export function podeTransitar(atual: StatusOcorrencia, novo: StatusOcorrencia): boolean {
  return PROXIMO[atual] === novo
}
