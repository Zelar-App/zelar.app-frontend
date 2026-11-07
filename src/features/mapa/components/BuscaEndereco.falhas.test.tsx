import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiProvider } from '../../../services/api/ApiContext'
import { apiDeTeste } from '../../../test/helpers'
import type { ResultadoEndereco } from '../../../domain/types'
import { BuscaEndereco } from './BuscaEndereco'

function montar(buscar = vi.fn<(...args: [string, AbortSignal?]) => Promise<ResultadoEndereco[]>>()) {
  const api = apiDeTeste()
  api.geocoding.buscar = buscar
  return { buscar, ...render(<ApiProvider api={api}><BuscaEndereco aoSelecionar={vi.fn()} /></ApiProvider>) }
}

describe('falhas e cancelamento na busca de endereço', () => {
  it('não envia consulta vazia e permite limpar antes de buscar', async () => {
    const { buscar } = montar()
    fireEvent.submit(screen.getByRole('search'))
    await userEvent.type(screen.getByRole('searchbox'), '   ')
    fireEvent.submit(screen.getByRole('search'))
    expect(buscar).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar busca' }))
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  it.each([new Error('Servidor indisponível'), 'falha desconhecida'])('apresenta mensagem para falha %s e recupera em nova busca', async (erro) => {
    const buscar = vi.fn().mockRejectedValueOnce(erro).mockResolvedValueOnce([])
    montar(buscar)
    await userEvent.type(screen.getByRole('searchbox'), 'Rua{Enter}')
    expect(await screen.findByText(erro instanceof Error ? erro.message : 'Não foi possível buscar agora.')).toBeInTheDocument()
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByText('Nenhum endereço encontrado.')).toBeInTheDocument()
    expect(screen.queryByText('Servidor indisponível')).toBeNull()
  })

  it.each(['resolve', 'reject'])('ignora resposta cancelada ao limpar (%s)', async (modo) => {
    let resolver!: (r: ResultadoEndereco[]) => void, rejeitar!: (e: Error) => void
    const pendente = new Promise<ResultadoEndereco[]>((resolve, reject) => { resolver = resolve; rejeitar = reject })
    const { buscar } = montar(vi.fn().mockReturnValue(pendente))
    await userEvent.type(screen.getByRole('searchbox'), 'Rua{Enter}')
    const signal = buscar.mock.calls[0][1]!
    await userEvent.click(screen.getByRole('button', { name: 'Limpar busca' }))
    expect(signal.aborted).toBe(true)
    await act(async () => { if (modo === 'resolve') resolver([]); else rejeitar(new Error('Antiga')); await pendente.catch(() => {}) })
    expect(screen.queryByText('Antiga')).toBeNull()
    expect(screen.queryByText('Nenhum endereço encontrado.')).toBeNull()
  })

  it('aborta solicitação anterior ao pesquisar novamente e ao desmontar', async () => {
    const { buscar, unmount } = montar(vi.fn().mockImplementation(() => new Promise(() => {})))
    await userEvent.type(screen.getByRole('searchbox'), 'Rua{Enter}{Enter}')
    expect(buscar.mock.calls[0][1]!.aborted).toBe(true)
    const atual = buscar.mock.calls[1][1]!
    expect(atual.aborted).toBe(false)
    unmount(); expect(atual.aborted).toBe(true)
  })
})
