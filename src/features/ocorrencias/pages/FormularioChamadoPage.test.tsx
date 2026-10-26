import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { apiDeTeste, renderComProviders } from '../../../test/helpers'
import FormularioChamadoPage from './FormularioChamadoPage'

const rotas = [
  { path: '/abrir-chamado', element: <h1>Escolher local</h1> },
  { path: '/abrir-chamado/formulario', element: <FormularioChamadoPage /> },
  { path: '/historico/:id', element: <h1>Detalhe</h1> },
]

const localizacao = { latitude: -19.92, longitude: -43.93, enderecoAproximado: 'Praça Sete, Centro' }

async function montar(state: unknown = { localizacao }) {
  const api = apiDeTeste()
  await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
  const criar = vi.spyOn(api.ocorrencias, 'criar')
  const r = renderComProviders(<div />, {
    api,
    rotas: rotas.map((x) => (x.path === '/abrir-chamado/formulario' ? x : x)),
    rota: '/abrir-chamado/formulario',
  })
  // injeta o state da navegação como se viesse do passo 1
  await r.router.navigate('/abrir-chamado/formulario', { state, replace: true })
  return { ...r, criar }
}

describe('FormularioChamadoPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('sem localização no state volta para o passo 1', async () => {
    const { router } = await montar(null)
    await waitFor(() => expect(router.state.location.pathname).toBe('/abrir-chamado'))
  })

  it('mostra o endereço escolhido e exige categoria e descrição', async () => {
    const { criar } = await montar()
    expect(await screen.findByText('Praça Sete, Centro')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Enviar chamado' }))
    expect(await screen.findByText('Escolha uma categoria')).toBeInTheDocument()
    expect(screen.getByText('Descreva o problema')).toBeInTheDocument()
    expect(criar).not.toHaveBeenCalled()
  })

  it('envia a ocorrência e vai para o detalhe', async () => {
    const { criar, router } = await montar()
    await userEvent.click(await screen.findByRole('button', { name: 'Buraco na via' }))
    await userEvent.type(screen.getByLabelText('Descrição'), 'Buraco enorme na faixa da direita')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar chamado' }))
    await waitFor(() => expect(criar).toHaveBeenCalledTimes(1))
    expect(criar.mock.calls[0][0]).toMatchObject({ categoria: 'BURACO', descricao: 'Buraco enorme na faixa da direita', localizacao })
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/historico\/[0-9a-f-]{36}$/))
    expect(router.state.location.state).toEqual({ criado: true })
  })
})
