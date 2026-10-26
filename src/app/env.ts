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
  const apiBaseUrl = (raw.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
  const valores = (raw.VITE_MAP_CENTER ?? '').split(',').map((p) => p.trim())
  const partes = valores.map(Number)
  const centroValido = valores.length === 2 && valores.every(Boolean) && partes.every(Number.isFinite)
    && Math.abs(partes[0]) <= 90 && Math.abs(partes[1]) <= 180
  const mapCenter: [number, number] =
    centroValido ? [partes[0], partes[1]] : CENTRO_PADRAO
  return { apiMode, apiBaseUrl, mapCenter }
}

export const env: AppEnv = lerEnv(import.meta.env as RawEnv)
