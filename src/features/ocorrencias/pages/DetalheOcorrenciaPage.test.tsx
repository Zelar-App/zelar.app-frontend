import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { apiDeTeste, renderComProviders } from '../../../test/helpers'
import DetalheOcorrenciaPage from './DetalheOcorrenciaPage'

vi.mock('../../mapa/components/MapaBase', () => ({
  MapaBase: ({ children }: { children?: React.ReactNode }) => <div data-testid="mapa">{children}</div>,
}))
vi.mock('../../mapa/components/PinOcorrencia', () => ({ PinOcorrencia: () => <div data-testid="pin" /> }))

const rotas = [
  { path: '/historico', element: <h1>Histórico</h1> },
  { path: '/historico/:id', element: <DetalheOcorrenciaPage /> },
]

async function montar(id: string, state?: unknown) {
  const api = apiDeTeste()
  await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
  const r = renderComProviders(<div />, { api, rota: `/historico/${id}`, rotas })
  if (state) await r.router.navigate(`/historico/${id}`, { state, replace: true })
  return { ...r, api }
}

describe('DetalheOcorrenciaPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('mostra categoria, status, descrição, endereço, foto, mapa e linha do tempo', async () => {
    const api = apiDeTeste()
    await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
    const [comFoto] = await api.ocorrencias.listar({ categoria: 'BURACO' })
    await montar(comFoto.id)
    expect(await screen.findByRole('heading', { name: 'Buraco na via' })).toBeInTheDocument()
    expect(screen.getByText('Enviada', { selector: '[data-status]' })).toBeInTheDocument()
    expect(screen.getByText(comFoto.descricao)).toBeInTheDocument()
    expect(screen.getByText('Av. Afonso Pena, 1500 - Centro')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Foto/ })).toBeInTheDocument()
    expect(screen.getByTestId('mapa')).toBeInTheDocument()
    expect(screen.getByText('Sua solicitação foi enviada com sucesso')).toBeInTheDocument()
  })

  it('linha do tempo mostra todas as etapas de uma resolvida', async () => {
    const api = apiDeTeste()
    await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
    const [resolvida] = await api.ocorrencias.listar({ status: 'RESOLVIDA' })
    await montar(resolvida.id)
    expect(await screen.findByText('Seu chamado foi concluído e o problema foi resolvido!')).toBeInTheDocument()
    expect(screen.getByText('O órgão responsável foi acionado')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('vindo do formulário mostra a confirmação de envio', async () => {
    const api = apiDeTeste()
    await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
    const [o] = await api.ocorrencias.listar()
    await montar(o.id, { criado: true })
    expect(await screen.findByText(/Chamado enviado/)).toBeInTheDocument()
  })

  it('id inexistente mostra erro com volta ao histórico', async () => {
    await montar('nao-existe')
    expect(await screen.findByRole('alert')).toHaveTextContent('Ocorrência não encontrada')
    expect(screen.getByRole('link', { name: /histórico/i })).toHaveAttribute('href', '/historico')
  })
})
