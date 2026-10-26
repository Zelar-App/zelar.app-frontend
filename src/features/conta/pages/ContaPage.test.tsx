import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { carregarDb, salvarDb } from '../../../services/api/mock/db'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { apiDeTeste, renderComProviders } from '../../../test/helpers'
import ContaPage from './ContaPage'

const rotas = [
  { path: '/conta', element: <ContaPage /> },
  { path: '/login', element: <h1>Login</h1> },
  { path: '/admin', element: <h1>Admin</h1> },
]

async function montar(indice: 0 | 1) {
  const api = apiDeTeste()
  await api.auth.login({ email: USUARIOS_SEED[indice].email, senha: USUARIOS_SEED[indice].senha })
  return renderComProviders(<div />, { api, rota: '/conta', rotas })
}

describe('ContaPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('mostra os dados da cidadã, sem link de admin', async () => {
    await montar(0)
    expect(await screen.findByText('Joana Silva')).toBeInTheDocument()
    expect(screen.getByText('joana@zelar.app')).toBeInTheDocument()
    expect(screen.getByText('(31) 99999-0001')).toBeInTheDocument()
    expect(screen.getByText('Cidadão')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Painel administrativo/ })).toBeNull()
  })

  it('admin vê o link para o painel', async () => {
    await montar(1)
    expect(await screen.findByRole('link', { name: /Painel administrativo/ })).toHaveAttribute('href', '/admin')
    expect(screen.getByText('Administrador')).toBeInTheDocument()
  })

  it('sair encerra a sessão e vai para o login', async () => {
    const { router } = await montar(0)
    await userEvent.click(await screen.findByRole('button', { name: 'Sair da conta' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(window.localStorage.getItem('zelar.sessao')).toBeNull()
  })

  it('resetar dados demo volta o banco ao seed e encerra a sessão', async () => {
    const db = carregarDb()
    db.ocorrencias = []
    salvarDb(db)
    const { router } = await montar(0)
    await userEvent.click(await screen.findByRole('button', { name: 'Resetar dados demo' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Sim, resetar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(carregarDb().ocorrencias.length).toBeGreaterThanOrEqual(8)
  })
})
