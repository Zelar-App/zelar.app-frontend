import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { apiDeTeste, renderComProviders } from '../../../test/helpers'
import HistoricoPage from './HistoricoPage'

const rotas = [
  { path: '/historico', element: <HistoricoPage /> },
  { path: '/historico/:id', element: <h1>Detalhe</h1> },
  { path: '/abrir-chamado', element: <h1>Abrir</h1> },
]

async function montar() {
  const api = apiDeTeste()
  await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
  return renderComProviders(<div />, { api, rota: '/historico', rotas })
}

describe('HistoricoPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('lista os chamados da cidadã, mais recentes primeiro, com status', async () => {
    await montar()
    const itens = await screen.findAllByRole('listitem')
    expect(itens).toHaveLength(5)
    expect(within(itens[0]).getByText('Sinalização danificada')).toBeInTheDocument() // 30h atrás
    expect(within(itens[0]).getByText('Em análise')).toBeInTheDocument()
    expect(within(itens[4]).getByText('Problema na calçada')).toBeInTheDocument() // 360h atrás
  })

  it('filtra por status e mostra estado vazio quando nada bate', async () => {
    await montar()
    await screen.findAllByRole('listitem')
    await userEvent.click(screen.getByRole('button', { name: 'Resolvidas' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: 'Enviadas' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: 'Todas' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })

  it('abre o detalhe ao tocar num item', async () => {
    const { router } = await montar()
    const [primeiro] = await screen.findAllByRole('link')
    await userEvent.click(primeiro)
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/historico\/.+/))
  })
})
