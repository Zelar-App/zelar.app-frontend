import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAsync } from './useAsync'

function pendente<T>() {
  let resolve!: (valor: T) => void
  let reject!: (erro: unknown) => void
  const promise = new Promise<T>((ok, falha) => { resolve = ok; reject = falha })
  return { promise, resolve, reject }
}

describe('useAsync', () => {
  it('mantém dados ao recarregar, informa falha e limpa erro após recuperação', async () => {
    const buscar = vi.fn<() => Promise<number>>().mockResolvedValueOnce(1).mockRejectedValueOnce(new Error('Indisponível')).mockResolvedValueOnce(2)
    const { result } = renderHook(() => useAsync(buscar, []))
    await waitFor(() => expect(result.current.dados).toBe(1))
    await act(() => result.current.recarregar())
    expect(result.current).toMatchObject({ dados: 1, erro: 'Indisponível', carregando: false })
    await act(() => result.current.recarregar())
    expect(result.current).toMatchObject({ dados: 2, erro: null, carregando: false })
  })

  it.each(['sucesso', 'falha'])('ignora %s de uma execução antiga sem encerrar a nova', async (tipo) => {
    const antiga = pendente<number>()
    const nova = pendente<number>()
    const buscar = vi.fn().mockReturnValueOnce(antiga.promise).mockReturnValueOnce(nova.promise)
    const { result, rerender } = renderHook(({ chave }) => useAsync(buscar, [chave]), { initialProps: { chave: 1 } })
    rerender({ chave: 2 })
    await act(async () => { if (tipo === 'sucesso') antiga.resolve(10); else antiga.reject(new Error('Erro antigo')) })
    expect(result.current).toMatchObject({ dados: null, erro: null, carregando: true })
    await act(async () => nova.resolve(20))
    expect(result.current).toMatchObject({ dados: 20, erro: null, carregando: false })
  })
})
