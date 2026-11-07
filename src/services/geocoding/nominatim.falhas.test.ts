import { afterEach, describe, expect, it, vi } from 'vitest'
import { criarNominatim } from './nominatim'

afterEach(() => vi.restoreAllMocks())

describe('falhas de geocodificação', () => {
  it('não consulta endereço branco nem oculta erro HTTP de busca', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 503 }))
    const geo = criarNominatim()
    await expect(geo.buscar('  ')).resolves.toEqual([])
    expect(fetch).not.toHaveBeenCalled()
    await expect(geo.buscar('Praça')).rejects.toThrow(/buscar o endereço/)
  })

  it('retorna ausência em HTTP inválido, resposta sem endereço e falha de rede', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(new Response('{}')).mockRejectedValueOnce(new Error('Rede'))
    const geo = criarNominatim()
    await expect(geo.reverso(1, 2)).resolves.toBeNull()
    await expect(geo.reverso(1, 2)).resolves.toBeNull()
    await expect(geo.reverso(1, 2)).resolves.toBeNull()
  })
})
