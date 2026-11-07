import type { ReactNode } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MapaBase } from './MapaBase'
import { SeletorLocal } from './SeletorLocal'
import { PinOcorrencia } from './PinOcorrencia'
import { BotaoLocalizar } from './BotaoLocalizar'
import { gerarOcorrenciasSeed } from '../../../services/api/mock/seed'

const estado = vi.hoisted(() => ({
  mapa: { getContainer: vi.fn(), invalidateSize: vi.fn(), getCenter: vi.fn(), getZoom: vi.fn(), flyTo: vi.fn() },
  propriedades: {} as Record<string, unknown>,
  marcador: {} as Record<string, unknown>,
  eventos: {} as Record<string, (e: unknown) => void>,
  geo: { carregando: false, posicao: null as null | [number, number], localizar: vi.fn() },
}))
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: { children: ReactNode }) => { estado.propriedades = props; return <div>{children}</div> },
  TileLayer: () => null,
  useMap: () => estado.mapa,
  useMapEvents: (eventos: typeof estado.eventos) => { estado.eventos = eventos; return estado.mapa },
  Marker: (props: Record<string, unknown>) => { estado.marcador = props; return null },
}))
vi.mock('../../../shared/hooks/useGeolocation', () => ({ useGeolocation: () => estado.geo }))

beforeEach(() => {
  vi.clearAllMocks()
  estado.mapa.getContainer.mockReturnValue(document.createElement('div'))
  estado.mapa.getCenter.mockReturnValue({ lat: 0, lng: 0 })
  estado.mapa.getZoom.mockReturnValue(12)
  estado.geo.carregando = false
  estado.geo.posicao = null
})
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('integração dos controles com Leaflet e GPS', () => {
  it('inicializa, redimensiona e desconecta observador ao desmontar', () => {
    vi.useFakeTimers()
    const observe = vi.fn(), disconnect = vi.fn()
    let redimensionar: () => void = () => {}
    vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { redimensionar = callback } observe = observe; disconnect = disconnect })
    const pronto = vi.fn()
    const { unmount } = render(<MapaBase aoPronto={pronto}><p>Mapa</p></MapaBase>)
    expect(pronto).toHaveBeenCalledWith(estado.mapa)
    expect(observe).toHaveBeenCalledWith(estado.mapa.getContainer())
    act(() => { vi.runAllTimers(); redimensionar() })
    expect(estado.mapa.invalidateSize).toHaveBeenCalledTimes(2)
    expect(estado.propriedades).toMatchObject({ zoom: 14, dragging: true })
    unmount(); expect(disconnect).toHaveBeenCalledOnce()
  })

  it('aceita miniatura estática sem observador e cancela ajuste pendente', () => {
    vi.useFakeTimers(); vi.stubGlobal('ResizeObserver', undefined)
    const { unmount } = render(<MapaBase centro={[1, 2]} zoom={10} estatico className="miniatura" />)
    expect(estado.propriedades).toMatchObject({ center: [1, 2], zoom: 10, dragging: false, keyboard: false })
    unmount(); act(() => vi.runAllTimers())
    expect(estado.mapa.invalidateSize).not.toHaveBeenCalled()
  })

  it('segue coordenadas externas uma vez e publica movimento do usuário', () => {
    const mover = vi.fn()
    const { rerender } = render(<SeletorLocal centro={[1, 2]} aoMover={mover} />)
    expect(estado.mapa.flyTo).toHaveBeenLastCalledWith([1, 2], 16, { duration: 0.6 })
    rerender(<SeletorLocal centro={[1, 2]} aoMover={mover} />)
    expect(estado.mapa.flyTo).toHaveBeenCalledOnce()
    estado.mapa.getZoom.mockReturnValue(18)
    rerender(<SeletorLocal centro={[1, 3]} aoMover={mover} zoom={18} />)
    expect(estado.mapa.flyTo).toHaveBeenLastCalledWith([1, 3], 18, { duration: 0.6 })
    rerender(<SeletorLocal centro={[2, 3]} aoMover={mover} />)
    estado.mapa.getCenter.mockReturnValue({ lat: 2, lng: 3 })
    rerender(<SeletorLocal centro={[2, 3]} aoMover={mover} />)
    act(() => estado.eventos.moveend({ target: estado.mapa }))
    expect(mover).toHaveBeenCalledWith([2, 3])
    expect(estado.mapa.flyTo).toHaveBeenCalledTimes(3)
  })

  it('associa posição, título e clique ao chamado do marcador', () => {
    const ocorrencia = gerarOcorrenciasSeed()[0], clicar = vi.fn()
    const { rerender } = render(<PinOcorrencia ocorrencia={ocorrencia} ativo aoClicar={clicar} />)
    expect(estado.marcador.position).toEqual([ocorrencia.localizacao.latitude, ocorrencia.localizacao.longitude])
    const eventos = estado.marcador.eventHandlers as { click: () => void }
    eventos.click(); expect(clicar).toHaveBeenCalledWith(ocorrencia)
    rerender(<PinOcorrencia ocorrencia={ocorrencia} />)
    expect(estado.marcador.eventHandlers).toBeUndefined()
  })

  it('centraliza após GPS e avisa consumidor', async () => {
    estado.geo.localizar.mockResolvedValue({ posicao: [1, 2] })
    const localizar = vi.fn()
    render(<BotaoLocalizar mapa={estado.mapa as unknown as L.Map} zoom={19} aoLocalizar={localizar} />)
    await userEvent.click(screen.getByRole('button', { name: 'Usar minha localização' }))
    expect(estado.mapa.flyTo).toHaveBeenCalledWith([1, 2], 19, { duration: 0.8 })
    expect(localizar).toHaveBeenCalledWith([1, 2])
  })

  it('informa falha e funciona sem callbacks ou mapa', async () => {
    const erro = vi.fn()
    estado.geo.localizar.mockResolvedValue({ posicao: null, erro: 'GPS indisponível' })
    const { rerender } = render(<BotaoLocalizar mapa={null} aoErro={erro} />)
    await userEvent.click(screen.getByRole('button'))
    expect(erro).toHaveBeenCalledWith('GPS indisponível')
    rerender(<BotaoLocalizar mapa={null} />)
    await userEvent.click(screen.getByRole('button'))
    estado.geo.localizar.mockResolvedValue({ posicao: [1, 2] })
    await userEvent.click(screen.getByRole('button'))
    expect(estado.mapa.flyTo).not.toHaveBeenCalled()
    estado.geo.carregando = true; estado.geo.posicao = [1, 2]
    rerender(<BotaoLocalizar mapa={null} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
