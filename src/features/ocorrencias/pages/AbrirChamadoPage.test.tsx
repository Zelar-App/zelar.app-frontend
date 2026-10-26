import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { apiDeTeste, renderComProviders } from '../../../test/helpers'
import AbrirChamadoPage from './AbrirChamadoPage'

// Leaflet não renderiza em jsdom: o mapa vira um marcador de posição.
vi.mock('../../mapa/components/SeletorLocal', () => ({
  SeletorLocal: () => <div data-testid="mapa-seletor" />,
}))

const rotas = [
  { path: '/abrir-chamado', element: <AbrirChamadoPage /> },
  { path: '/abrir-chamado/formulario', element: <h1>Formulário</h1> },
]

describe('AbrirChamadoPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('confirma o local e navega ao formulário levando a localização no state', async () => {
    const api = apiDeTeste()
    api.geocoding = { buscar: async () => [], reverso: async () => 'Praça Sete, Centro' }
    await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
    const { router } = renderComProviders(<div />, { api, rota: '/abrir-chamado', rotas })
    expect(screen.getByTestId('mapa-seletor')).toBeInTheDocument()
    expect(await screen.findByText('Praça Sete, Centro')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar este local' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/abrir-chamado/formulario'))
    expect(router.state.location.state).toEqual({
      localizacao: { latitude: -19.9167, longitude: -43.9345, enderecoAproximado: 'Praça Sete, Centro' },
    })
  })
})
