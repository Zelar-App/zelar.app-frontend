import type { Ocorrencia } from '../../../domain/types'
import { useApi } from '../../../services/api/useApi'
import { useAsync } from '../../../shared/hooks/useAsync'

export interface OcorrenciaEstado {
  ocorrencia: Ocorrencia | null
  erro: string | null
  carregando: boolean
  recarregar(): Promise<void>
}

export function useOcorrencia(id: string | undefined): OcorrenciaEstado {
  const api = useApi()
  const { dados, erro, carregando, recarregar } = useAsync(
    () => (id ? api.ocorrencias.buscarPorId(id) : Promise.reject(new Error('Ocorrência não encontrada'))),
    [api, id],
  )
  return { ocorrencia: dados, erro, carregando, recarregar }
}
