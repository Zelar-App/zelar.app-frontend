import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { USUARIOS_SEED } from '../../services/api/mock/seed'
import { apiDeTeste, renderComProviders } from '../../test/helpers'
import { ProtectedRoute } from './ProtectedRoute'

const rotas = [
  { path: '/login', element: <h1>Login</h1> },
  { path: '/', element: <h1>Início</h1> },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/privada', element: <h1>Privada</h1> }],
  },
  {
    element: <ProtectedRoute perfil="ADMINISTRADOR" />,
    children: [{ path: '/admin', element: <h1>Admin</h1> }],
  },
]

describe('ProtectedRoute', () => {
  beforeEach(() => window.localStorage.clear())

  it('sem sessão redireciona para /login guardando a origem', async () => {
    const { router } = renderComProviders(<div />, { rota: '/privada', rotas })
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.state).toEqual({ de: '/privada' })
  })

  it('com sessão de cidadão mostra a rota privada mas manda /admin para o início', async () => {
    const api = apiDeTeste()
    await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
    renderComProviders(<div />, { api, rota: '/privada', rotas })
    expect(await screen.findByText('Privada')).toBeInTheDocument()

    const { router } = renderComProviders(<div />, { api, rota: '/admin', rotas })
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('admin acessa /admin', async () => {
    const api = apiDeTeste()
    await api.auth.login({ email: USUARIOS_SEED[1].email, senha: USUARIOS_SEED[1].senha })
    renderComProviders(<div />, { api, rota: '/admin', rotas })
    expect(await screen.findByText('Admin')).toBeInTheDocument()
  })
})
