import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ApiProvider } from '../../../services/api/ApiContext'
import { apiDeTeste } from '../../../test/helpers'
import { useEscolherLocal } from './useEscolherLocal'
import { useOcorrencia } from './useOcorrencia'
import { gerarOcorrenciasSeed } from '../../../services/api/mock/seed'

describe('consultas de ocorrência e geocodificação', () => {
  it('recusa identificador ausente sem consultar API e recupera com identificador válido', async () => {
    const api = apiDeTeste()
    const ocorrencia = gerarOcorrenciasSeed()[0]
    const buscar = vi.spyOn(api.ocorrencias, 'buscarPorId').mockResolvedValue(ocorrencia)
    const wrapper = ({ children }: { children: ReactNode }) => <ApiProvider api={api}>{children}</ApiProvider>
    const { result, rerender } = renderHook(({ id }: { id?: string }) => useOcorrencia(id), { wrapper, initialProps: {} })
    await waitFor(() => expect(result.current.erro).toBe('Ocorrência não encontrada'))
    expect(buscar).not.toHaveBeenCalled()
    rerender({ id: ocorrencia.id })
    await waitFor(() => expect(result.current.ocorrencia).toEqual(ocorrencia))
  })

  it('mantém centro para ruído do GPS e resolve falha de endereço sem travar carregamento', async () => {
    const api = apiDeTeste()
    api.geocoding.reverso = vi.fn().mockRejectedValue(new Error('offline'))
    const wrapper = ({ children }: { children: ReactNode }) => <ApiProvider api={api}>{children}</ApiProvider>
    const { result } = renderHook(() => useEscolherLocal({ inicial: [1, 2], atrasoMs: 1 }), { wrapper })
    await waitFor(() => expect(result.current.buscandoEndereco).toBe(false))
    const centro = result.current.centro
    act(() => result.current.moverPara([1.000001, 2.000001]))
    expect(result.current.centro).toBe(centro)
    act(() => result.current.moverPara([1, 3]))
    await waitFor(() => expect(api.geocoding.reverso).toHaveBeenLastCalledWith(1, 3))
    await waitFor(() => expect(result.current.buscandoEndereco).toBe(false))
    expect(result.current.confirmar()).toEqual({ latitude: 1, longitude: 3, enderecoAproximado: null })
  })

  it.each([false, true])('ignora término tardio depois de desmontar (falha=%s)', async (falha) => {
    const api = apiDeTeste()
    let resolver!: (r: string) => void, rejeitar!: (e: Error) => void
    const pendente = new Promise<string>((resolve, reject) => { resolver = resolve; rejeitar = reject })
    api.geocoding.reverso = vi.fn().mockReturnValue(pendente)
    const wrapper = ({ children }: { children: ReactNode }) => <ApiProvider api={api}>{children}</ApiProvider>
    const { result, unmount } = renderHook(() => useEscolherLocal(), { wrapper })
    unmount()
    await act(async () => { if (falha) rejeitar(new Error('offline')); else resolver('Rua antiga'); await pendente.catch(() => {}) })
    expect(result.current.endereco).toBeNull()
  })
})
