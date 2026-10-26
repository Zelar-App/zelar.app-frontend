import { env, type AppEnv } from '../../app/env'
import { criarNominatim } from '../geocoding/nominatim'
import type { Api } from './contracts'
import { criarAuthHttp, lerTokenHttp } from './http/auth.http'
import { criarClienteHttp } from './http/client'
import { criarOcorrenciasHttp } from './http/ocorrencias.http'
import { criarAuthMock } from './mock/auth.mock'
import { criarOcorrenciasMock } from './mock/ocorrencias.mock'

export function criarApi(cfg: AppEnv): Api {
  const geocoding = criarNominatim()
  if (cfg.apiMode === 'http') {
    const http = criarClienteHttp({ baseUrl: cfg.apiBaseUrl, obterToken: lerTokenHttp })
    return { modo: 'http', auth: criarAuthHttp(http), ocorrencias: criarOcorrenciasHttp(http), geocoding }
  }
  return { modo: 'mock', auth: criarAuthMock(), ocorrencias: criarOcorrenciasMock(), geocoding }
}

let instancia: Api | null = null

/** Singleton escolhido por VITE_API_MODE. */
export function getApi(): Api {
  instancia ??= criarApi(env)
  return instancia
}

export type { Api, AuthRepository, GeocodingService, OcorrenciaRepository } from './contracts'
export { ApiError, ehApiError, mensagemDeErro } from './errors'
