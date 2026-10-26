import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { apiDeTeste, renderComProviders } from '../../../test/helpers'
import AdminPage from './AdminPage'

const rotas = [
  { path: '/admin', element: <AdminPage /> },
  { path: '/historico/:id', element: <h1>Detalhe</h1> },
]

async function montar() {
  const api = apiDeTeste()
  await api.auth.login({ email: USUARIOS_SEED[1].email, senha: USUARIOS_SEED[1].senha })
  const atualizar = vi.spyOn(api.ocorrencias, 'atualizar')
  const indicadores = vi.spyOn(api.ocorrencias, 'indicadores')
  return { ...renderComProviders(<div />, { api, rota: '/admin', rotas }), atualizar, indicadores }
}

const indicador = (nome: string) => within(screen.getByRole('region', { name: nome })).getByText(/^\d+$/)

describe('AdminPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('mostra indicadores vindos do contrato e lista todas as ocorrências', async () => {
    const { indicadores } = await montar()
    await waitFor(() => expect(indicador('Total')).toHaveTextContent('8'))
    expect(indicadores).toHaveBeenCalled()
    expect(indicador('Enviadas')).toHaveTextContent('3')
    expect(indicador('Em análise')).toHaveTextContent('3')
    expect(indicador('Resolvidas')).toHaveTextContent('2')
    expect(screen.getAllByRole('listitem')).toHaveLength(8)
  })

  it('filtra por status e por prioridade', async () => {
    await montar()
    await screen.findAllByRole('listitem')
    await userEvent.click(screen.getByRole('button', { name: 'Em análise' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    await userEvent.selectOptions(screen.getByLabelText('Prioridade'), 'ALTA')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: 'Todas' }))
    await userEvent.selectOptions(screen.getByLabelText('Prioridade'), '')
    expect(screen.getAllByRole('listitem')).toHaveLength(8)
  })

  it('avança o status e define prioridade; indicadores atualizam', async () => {
    const { atualizar } = await montar()
    await waitFor(() => expect(indicador('Enviadas')).toHaveTextContent('3'))
    await userEvent.click(screen.getByRole('button', { name: 'Enviadas' }))
    const [primeira] = screen.getAllByRole('listitem')
    await userEvent.click(within(primeira).getByRole('button', { name: 'Gerenciar' }))
    const dialogo = await screen.findByRole('dialog')
    await userEvent.selectOptions(within(dialogo).getByLabelText('Prioridade'), 'ALTA')
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Avançar para Em análise' }))
    await waitFor(() => expect(atualizar).toHaveBeenCalledWith(expect.any(String), { status: 'EM_ANALISE', prioridade: 'ALTA' }))
    await waitFor(() => expect(indicador('Enviadas')).toHaveTextContent('2'))
    expect(indicador('Em análise')).toHaveTextContent('4')
  })

  it('resolvida não tem próximo status', async () => {
    await montar()
    await screen.findAllByRole('listitem')
    await userEvent.click(screen.getByRole('button', { name: 'Resolvidas' }))
    const [primeira] = screen.getAllByRole('listitem')
    await userEvent.click(within(primeira).getByRole('button', { name: 'Gerenciar' }))
    const dialogo = await screen.findByRole('dialog')
    expect(within(dialogo).queryByRole('button', { name: /Avançar/ })).toBeNull()
    expect(within(dialogo).getByText(/encerrad/i)).toBeInTheDocument()
  })
})
