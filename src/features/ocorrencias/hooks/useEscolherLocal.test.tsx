import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ApiProvider } from '../../../services/api/ApiContext'
import { apiDeTeste } from '../../../test/helpers'
import { useEscolherLocal } from './useEscolherLocal'

function montar() {
  const api = apiDeTeste()
  const reverso = vi.fn(async (lat: number, lng: number) => `Rua em ${lat.toFixed(2)},${lng.toFixed(2)}`)
  api.geocoding = { buscar: async () => [], reverso }
  const wrapper = ({ children }: { children: ReactNode }) => <ApiProvider api={api}>{children}</ApiProvider>
  return { reverso, ...renderHook(() => useEscolherLocal({ atrasoMs: 10 }), { wrapper }) }
}

describe('useEscolherLocal', () => {
  it('começa no centro padrão e sem endereço', () => {
    const { result } = montar()
    expect(result.current.centro).toEqual([-19.9167, -43.9345])
    expect(result.current.endereco).toBeNull()
  })

  it('ao mover o centro faz geocodificação reversa só da posição final (além da inicial)', async () => {
    const { result, reverso } = montar()
    await waitFor(() => expect(result.current.endereco).toBe('Rua em -19.92,-43.93'))
    act(() => result.current.moverPara([-19.92, -43.93]))
    act(() => result.current.moverPara([-19.93, -43.94]))
    await waitFor(() => expect(result.current.endereco).toBe('Rua em -19.93,-43.94'))
    expect(reverso).toHaveBeenCalledTimes(2)
    expect(reverso).toHaveBeenLastCalledWith(-19.93, -43.94)
  })

  it('confirmar devolve a localização com o endereço aproximado', async () => {
    const { result } = montar()
    act(() => result.current.moverPara([-19.92, -43.93]))
    await waitFor(() => expect(result.current.endereco).not.toBeNull())
    expect(result.current.confirmar()).toEqual({ latitude: -19.92, longitude: -43.93, enderecoAproximado: 'Rua em -19.92,-43.93' })
  })

  it('confirmar logo após mover não usa o endereço da posição anterior', async () => {
    const { result } = montar()
    await waitFor(() => expect(result.current.endereco).not.toBeNull())
    act(() => result.current.moverPara([-19.95, -43.95]))
    expect(result.current.buscandoEndereco).toBe(true)
    expect(result.current.confirmar()).toEqual({ latitude: -19.95, longitude: -43.95, enderecoAproximado: null })
    await waitFor(() => expect(result.current.endereco).toBe('Rua em -19.95,-43.95'))
    expect(result.current.buscandoEndereco).toBe(false)
    expect(result.current.confirmar().enderecoAproximado).toBe('Rua em -19.95,-43.95')
  })
})
