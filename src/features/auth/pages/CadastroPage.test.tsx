import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { renderComProviders } from '../../../test/helpers'
import CadastroPage from './CadastroPage'

const rotas = [
  { path: '/cadastro', element: <CadastroPage /> },
  { path: '/', element: <h1>Início</h1> },
]

async function preencher(dados: { nome?: string; email?: string; senha?: string; telefone?: string }) {
  if (dados.nome) await userEvent.type(screen.getByLabelText('Nome completo'), dados.nome)
  if (dados.email) await userEvent.type(screen.getByLabelText('E-mail'), dados.email)
  if (dados.senha) await userEvent.type(screen.getByLabelText('Senha'), dados.senha)
  if (dados.telefone) await userEvent.type(screen.getByLabelText(/Telefone/), dados.telefone)
}

describe('CadastroPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('exige senha entre 8 e 72 caracteres', async () => {
    renderComProviders(<CadastroPage />, { rota: '/cadastro', rotas })
    await preencher({ nome: 'Ana', email: 'ana@x.com', senha: '1234567' })
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByText('A senha deve possuir entre 8 e 72 caracteres')).toBeInTheDocument()
  })

  it('mostra o 409 do backend para e-mail repetido', async () => {
    renderComProviders(<CadastroPage />, { rota: '/cadastro', rotas })
    await preencher({ nome: 'Ana', email: USUARIOS_SEED[0].email, senha: 'senha1234' })
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByText('E-mail já cadastrado')).toBeInTheDocument()
  })

  it('cadastro válido entra direto no app', async () => {
    const { router } = renderComProviders(<CadastroPage />, { rota: '/cadastro', rotas })
    await preencher({ nome: 'Ana Souza', email: 'ana@x.com', senha: 'senha1234', telefone: '31999990000' })
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
