import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { renderComProviders } from '../../../test/helpers'
import LoginPage from './LoginPage'

const joana = USUARIOS_SEED[0]

const rotas = [
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <h1>Início</h1> },
]

describe('LoginPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('valida campos obrigatórios sem chamar a API', async () => {
    renderComProviders(<LoginPage />, { rota: '/login', rotas })
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findAllByRole('alert')).toHaveLength(2)
  })

  it('mostra erro 401 para senha errada', async () => {
    renderComProviders(<LoginPage />, { rota: '/login', rotas })
    await userEvent.type(screen.getByLabelText('E-mail'), joana.email)
    await userEvent.type(screen.getByLabelText('Senha'), 'errada123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('E-mail ou senha inválidos')).toBeInTheDocument()
  })

  it('login válido navega para o início', async () => {
    const { router } = renderComProviders(<LoginPage />, { rota: '/login', rotas })
    await userEvent.type(screen.getByLabelText('E-mail'), joana.email)
    await userEvent.type(screen.getByLabelText('Senha'), joana.senha)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
