import { afterEach, describe, expect, it, vi } from 'vitest'
import { criarNominatim } from './nominatim'

describe('nominatim', () => {
  afterEach(() => vi.restoreAllMocks())

  it('busca com limit=5 e countrycodes=br e mapeia os resultados', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ display_name: 'Av. Afonso Pena, BH', lat: '-19.92', lon: '-43.93' }]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const geo = criarNominatim()
    const r = await geo.buscar('afonso pena')
    expect(r).toEqual([{ rotulo: 'Av. Afonso Pena, BH', latitude: -19.92, longitude: -43.93 }])
    const url = new URL(String(fetchMock.mock.calls[0][0]))
    expect(url.hostname).toBe('nominatim.openstreetmap.org')
    expect(url.searchParams.get('q')).toBe('afonso pena')
    expect(url.searchParams.get('limit')).toBe('5')
    expect(url.searchParams.get('countrycodes')).toBe('br')
  })

  it('reverso devolve display_name ou null em erro', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ display_name: 'Rua X, 1' }), { status: 200 }),
    )
    const geo = criarNominatim()
    expect(await geo.reverso(-19.9, -43.9)).toBe('Rua X, 1')
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('net'))
    expect(await geo.reverso(-19.9, -43.9)).toBeNull()
  })
})
