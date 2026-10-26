import type { ResultadoEndereco } from '../../domain/types'
import type { GeocodingService } from '../api/contracts'

const BASE = 'https://nominatim.openstreetmap.org'

interface RespostaNominatim {
  display_name: string
  lat: string
  lon: string
}

/**
 * Nominatim (OpenStreetMap). Política de uso: máx. 1 req/s e nada de autocomplete por tecla.
 * A UI só chama `buscar` no Enter/botão.
 */
export function criarNominatim(): GeocodingService {
  return {
    async buscar(consulta: string, sinal?: AbortSignal): Promise<ResultadoEndereco[]> {
      const q = consulta.trim()
      if (!q) return []
      const url = new URL(`${BASE}/search`)
      url.searchParams.set('q', q)
      url.searchParams.set('format', 'jsonv2')
      url.searchParams.set('limit', '5')
      url.searchParams.set('countrycodes', 'br')
      url.searchParams.set('accept-language', 'pt-BR')
      const res = await fetch(url, { signal: sinal, headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error('Não foi possível buscar o endereço agora.')
      const dados = (await res.json()) as RespostaNominatim[]
      return dados.map((d) => ({ rotulo: d.display_name, latitude: Number(d.lat), longitude: Number(d.lon) }))
    },

    async reverso(latitude: number, longitude: number): Promise<string | null> {
      try {
        const url = new URL(`${BASE}/reverse`)
        url.searchParams.set('lat', String(latitude))
        url.searchParams.set('lon', String(longitude))
        url.searchParams.set('format', 'jsonv2')
        url.searchParams.set('accept-language', 'pt-BR')
        const res = await fetch(url, { headers: { accept: 'application/json' } })
        if (!res.ok) return null
        const dados = (await res.json()) as Partial<RespostaNominatim>
        return dados.display_name ?? null
      } catch {
        return null
      }
    },
  }
}
