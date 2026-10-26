import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Ocorrencia } from '../../../domain/types'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { apiDeTeste, renderComProviders } from '../../../test/helpers'
import MapaPage from './MapaPage'

vi.mock('../components/MapaBase', () => ({
  MapaBase: ({ children }: { children?: React.ReactNode }) => <div data-testid="mapa">{children}</div>,
}))
vi.mock('../components/PinOcorrencia', () => ({
  PinOcorrencia: ({ ocorrencia, aoClicar }: { ocorrencia: Ocorrencia; aoClicar?: (o: Ocorrencia) => void }) => (
    <button type="button" data-testid="pin" data-status={ocorrencia.status} onClick={() => aoClicar?.(ocorrencia)}>
      pin {ocorrencia.categoria}
    </button>
  ),
}))
vi.mock('../components/BotaoLocalizar', () => ({ BotaoLocalizar: () => <button type="button">Usar minha localização</button> }))

const rotas = [
  { path: '/mapa', element: <MapaPage /> },
  { path: '/historico/:id', element: <h1>Detalhe</h1> },
  { path: '/abrir-chamado', element: <h1>Abrir</h1> },
]

async function montar() {
  const api = apiDeTeste()
  await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
  return renderComProviders(<div />, { api, rota: '/mapa', rotas })
}

describe('MapaPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('mostra um pin por chamado e filtra por status', async () => {
    await montar()
    expect(await screen.findAllByTestId('pin')).toHaveLength(5)
    await userEvent.click(screen.getByRole('button', { name: 'Resolvidas' }))
    expect(screen.getAllByTestId('pin')).toHaveLength(2)
    expect(screen.getAllByTestId('pin').every((p) => p.dataset.status === 'RESOLVIDA')).toBe(true)
    await userEvent.click(screen.getByRole('button', { name: 'Todas' }))
    expect(screen.getAllByTestId('pin')).toHaveLength(5)
  })

  it('tocar no pin abre o painel com resumo e link para o detalhe', async () => {
    const { router } = await montar()
    const pins = await screen.findAllByTestId('pin')
    await userEvent.click(pins.find((p) => p.textContent?.includes('ILUMINACAO'))!)
    const dialogo = await screen.findByRole('dialog')
    expect(within(dialogo).getByText('Iluminação pública')).toBeInTheDocument()
    expect(within(dialogo).getByText('Em análise')).toBeInTheDocument()
    expect(within(dialogo).getByText(/Poste apagado/)).toBeInTheDocument()
    await userEvent.click(within(dialogo).getByRole('link', { name: 'Ver detalhes' }))
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/historico\//))
  })

  it('tem atalho para abrir chamado', async () => {
    const { router } = await montar()
    await userEvent.click(await screen.findByRole('link', { name: 'Abrir chamado aqui' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/abrir-chamado'))
  })
})
