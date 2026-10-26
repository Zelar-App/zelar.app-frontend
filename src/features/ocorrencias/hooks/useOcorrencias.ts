import { useMemo } from 'react'
import type { FiltroOcorrencias, Ocorrencia } from '../../../domain/types'
import { useApi } from '../../../services/api/useApi'
import { useAsync } from '../../../shared/hooks/useAsync'

export interface OcorrenciasEstado {
  lista: Ocorrencia[]
  erro: string | null
  carregando: boolean
  recarregar(): Promise<void>
}

/** Lista de ocorrências visíveis ao usuário logado (cidadão: as suas; admin: todas). */
export function useOcorrencias(filtro?: FiltroOcorrencias): OcorrenciasEstado {
  const api = useApi()
  const chave = JSON.stringify(filtro ?? {})
  const { dados, erro, carregando, recarregar } = useAsync(() => api.ocorrencias.listar(filtro), [api, chave])
  const lista = useMemo(() => dados ?? [], [dados])
  return { lista, erro, carregando, recarregar }
}
