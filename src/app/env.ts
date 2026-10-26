export type ApiMode = 'mock' | 'http'

export interface AppEnv {
  apiMode: ApiMode
  apiBaseUrl: string
  mapCenter: [number, number]
}

type RawEnv = Record<string, string | undefined>

const CENTRO_PADRAO: [number, number] = [-19.9167, -43.9345] // Belo Horizonte

export function lerEnv(raw: RawEnv): AppEnv {
  const apiMode: ApiMode = raw.VITE_API_MODE === 'http' ? 'http' : 'mock'
  const apiBaseUrl = (raw.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '')
  const partes = (raw.VITE_MAP_CENTER ?? '').split(',').map((p) => Number(p.trim()))
  const mapCenter: [number, number] =
    partes.length === 2 && partes.every(Number.isFinite) ? [partes[0], partes[1]] : CENTRO_PADRAO
  return { apiMode, apiBaseUrl, mapCenter }
}

export const env: AppEnv = lerEnv(import.meta.env as RawEnv)
