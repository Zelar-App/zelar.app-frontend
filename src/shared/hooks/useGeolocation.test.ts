import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGeolocation } from './useGeolocation'

function simularGeo(impl: (ok: PositionCallback, erro?: PositionErrorCallback) => void) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition: vi.fn(impl) },
  })
}

describe('useGeolocation', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    // @ts-expect-error limpeza do mock
    delete navigator.geolocation
  })

  it('localizar resolve com [lat, lng] e guarda a posição', async () => {
    simularGeo((ok) => ok({ coords: { latitude: -19.9, longitude: -43.9 } } as GeolocationPosition))
    const { result } = renderHook(() => useGeolocation())
    let r: { posicao: [number, number] | null; erro: string | null } | undefined
    await act(async () => {
      r = await result.current.localizar()
    })
    expect(r).toEqual({ posicao: [-19.9, -43.9], erro: null })
    expect(result.current.posicao).toEqual([-19.9, -43.9])
    expect(result.current.erro).toBeNull()
  })

  it('permissão negada vira mensagem amigável e resolve null', async () => {
    simularGeo((_ok, erro) => erro?.({ code: 1, message: 'denied' } as GeolocationPositionError))
    const { result } = renderHook(() => useGeolocation())
    let r: { posicao: [number, number] | null; erro: string | null } | undefined
    await act(async () => {
      r = await result.current.localizar()
    })
    expect(r?.posicao).toBeNull()
    expect(r?.erro).toMatch(/permiss/i)
    expect(result.current.erro).toMatch(/permiss/i)
  })

  it('sem suporte a geolocalização informa e resolve null', async () => {
    const { result } = renderHook(() => useGeolocation())
    let r: { posicao: [number, number] | null; erro: string | null } | undefined
    await act(async () => {
      r = await result.current.localizar()
    })
    expect(r?.posicao).toBeNull()
    expect(r?.erro).toMatch(/não suporta/i)
  })

  it.each([[2, /obter sua localização/], [3, /demorou demais/], [99, /Erro ao obter/]] as const)(
    'traduz falha de GPS de código %s e encerra carregamento', async (codigo, mensagem) => {
      simularGeo((_ok, erro) => erro?.({ code: codigo } as GeolocationPositionError))
      const { result } = renderHook(() => useGeolocation())
      await act(async () => { await result.current.localizar() })
      expect(result.current.erro).toMatch(mensagem)
      expect(result.current.carregando).toBe(false)
    },
  )

  it('recusa ambiente sem navigator sem lançar erro de plataforma', async () => {
    const { result } = renderHook(() => useGeolocation())
    vi.stubGlobal('navigator', undefined)
    await act(async () => { await result.current.localizar() })
    expect(result.current.erro).toMatch(/não suporta/)
    vi.unstubAllGlobals()
  })
})
