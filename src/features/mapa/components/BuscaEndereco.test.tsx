import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiProvider } from '../../../services/api/ApiContext'
import { apiDeTeste } from '../../../test/helpers'
import { BuscaEndereco } from './BuscaEndereco'

function montar() {
  const api = apiDeTeste()
  const buscar = vi.fn(async (q: string) =>
    q === 'nada' ? [] : [{ rotulo: 'Av. Afonso Pena, Centro, Belo Horizonte', latitude: -19.92, longitude: -43.93 }],
  )
  api.geocoding = { buscar, reverso: async () => null }
  const aoSelecionar = vi.fn()
  render(
    <ApiProvider api={api}>
      <BuscaEndereco aoSelecionar={aoSelecionar} />
    </ApiProvider>,
  )
  return { buscar, aoSelecionar }
}

describe('BuscaEndereco', () => {
  it('não busca enquanto digita; busca no Enter e lista os resultados', async () => {
    const { buscar } = montar()
    const campo = screen.getByPlaceholderText('Pesquisar endereços...')
    await userEvent.type(campo, 'afonso pena')
    expect(buscar).not.toHaveBeenCalled()
    await userEvent.keyboard('{Enter}')
    expect(buscar).toHaveBeenCalledWith('afonso pena', expect.anything())
    expect(await screen.findByRole('option', { name: /Afonso Pena/ })).toBeInTheDocument()
  })

  it('selecionar um resultado devolve as coordenadas e fecha a lista', async () => {
    const { aoSelecionar } = montar()
    await userEvent.type(screen.getByPlaceholderText('Pesquisar endereços...'), 'afonso{Enter}')
    await userEvent.click(await screen.findByRole('option', { name: /Afonso Pena/ }))
    expect(aoSelecionar).toHaveBeenCalledWith({ rotulo: 'Av. Afonso Pena, Centro, Belo Horizonte', latitude: -19.92, longitude: -43.93 })
    expect(screen.queryByRole('option')).toBeNull()
  })

  it('sem resultados avisa o usuário', async () => {
    montar()
    await userEvent.type(screen.getByPlaceholderText('Pesquisar endereços...'), 'nada{Enter}')
    expect(await screen.findByText(/Nenhum endereço encontrado/)).toBeInTheDocument()
  })
})
