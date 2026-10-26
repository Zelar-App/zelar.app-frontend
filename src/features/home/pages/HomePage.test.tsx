import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { apiDeTeste, renderComProviders } from '../../../test/helpers'
import HomePage from './HomePage'

vi.mock('../../mapa/components/MapaBase', () => ({
  MapaBase: ({ children }: { children?: React.ReactNode }) => <div data-testid="mapa">{children}</div>,
}))
vi.mock('../../mapa/components/PinOcorrencia', () => ({ PinOcorrencia: () => <div data-testid="pin" /> }))

const rotas = [
  { path: '/', element: <HomePage /> },
  { path: '/mapa', element: <h1>Mapa</h1> },
  { path: '/conta', element: <h1>Conta</h1> },
  { path: '/historico', element: <h1>Histórico</h1> },
  { path: '/historico/:id', element: <h1>Detalhe</h1> },
]

async function montar() {
  const api = apiDeTeste()
  await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
  return renderComProviders(<div />, { api, rota: '/', rotas })
}

describe('HomePage', () => {
  beforeEach(() => window.localStorage.clear())

  it('dá boas-vindas pelo primeiro nome e mostra abertos, resolvidos e espera estimada', async () => {
    await montar()
    expect(await screen.findByText('Joana')).toBeInTheDocument()
    expect(screen.getByText('Bem Vindo(a)')).toBeInTheDocument()
    const resumo = await screen.findByRole('region', { name: 'Chamados Abertos e Resolvidos' })
    await waitFor(() => expect(within(resumo).getByText('3')).toBeInTheDocument()) // 1 ENVIADA + 2 EM_ANALISE
    expect(within(resumo).getByText('2')).toBeInTheDocument() // RESOLVIDA
    const espera = screen.getByRole('region', { name: 'Tempo de espera estimado' })
    expect(within(espera).getByText(/dias? restantes?/)).toBeInTheDocument()
  })

  it('caixa de entrada traz os 3 eventos mais recentes com hora', async () => {
    await montar()
    const caixa = await screen.findByRole('region', { name: 'Caixa de entrada' })
    const itens = await within(caixa).findAllByRole('listitem')
    expect(itens).toHaveLength(3)
    expect(within(itens[0]).getByText(/^\d{2}:\d{2}$/)).toBeInTheDocument()
  })

  it('Navegar leva ao mapa e o avatar à conta', async () => {
    const { router } = await montar()
    await userEvent.click(await screen.findByRole('link', { name: 'Navegar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/mapa'))
    await router.navigate('/')
    await userEvent.click(await screen.findByRole('link', { name: 'Minha conta' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/conta'))
  })

  it('o sino abre o painel com a caixa de entrada completa', async () => {
    await montar()
    await userEvent.click(await screen.findByRole('button', { name: 'Notificações' }))
    const dialogo = await screen.findByRole('dialog', { name: 'Caixa de entrada' })
    expect(within(dialogo).getAllByRole('listitem').length).toBeGreaterThan(3)
  })
})
