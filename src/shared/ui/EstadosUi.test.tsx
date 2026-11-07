import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'
import { Input } from './Input'
import { PageHeader } from './PageHeader'
import { EsperaCard } from '../../features/home/components/EsperaCard'
import { TimelineStatus } from '../../features/ocorrencias/components/TimelineStatus'
import NotFoundPage from '../pages/NotFoundPage'
import DevUiPage from '../pages/DevUiPage'

function Caminho() { return <p data-testid="caminho">{useLocation().pathname}</p> }

describe('estados e navegação dos componentes de interface', () => {
  it('mostra estado vazio completo e versão mínima sem ações falsas', () => {
    const { rerender } = render(<EmptyState titulo="Sem dados" descricao="Tente novamente" icone={<span>Ícone</span>} acao={<button>Atualizar</button>} />)
    expect(screen.getByRole('heading', { name: 'Sem dados' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument()
    rerender(<EmptyState titulo="Vazio" />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByText('Tente novamente')).toBeNull()
  })

  it('associa rótulo, dica e erro ao identificador explícito', () => {
    const { rerender } = render(<Input id="email" rotulo="Email" dica="Use seu endereço" iconeEsquerda={<span>@</span>} />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email')
    expect(screen.getByText('Use seu endereço')).toBeInTheDocument()
    rerender(<Input rotulo="Email" erro="Inválido" dica="Dica" />)
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Inválido')
    expect(screen.queryByText('Dica')).toBeNull()
  })

  it('volta pelo histórico quando recebe opção booleana', async () => {
    render(<MemoryRouter initialEntries={['/anterior', '/atual']}><PageHeader titulo="Atual" voltar /><Caminho /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(screen.getByTestId('caminho')).toHaveTextContent('/anterior')
  })

  it.each([[null, 'Sem chamados abertos'], [0, 'prazo chegou'], [1, 'dia restante'], [2, 'dias restantes']] as const)('explica estimativa %s sem prometer prazo real', (dias, texto) => {
    render(<MemoryRouter><EsperaCard diasRestantes={dias} /></MemoryRouter>)
    expect(screen.getByText(texto)).toBeInTheDocument()
  })

  it('ordena o histórico por data sem alterar o array de entrada', () => {
    const historico = [
      { status: 'RESOLVIDA' as const, data: '2026-11-06T14:00:00Z', mensagem: 'Fim' },
      { status: 'ENVIADA' as const, data: '2026-11-06T12:00:00Z', mensagem: 'Início' },
      { status: 'EM_ANALISE' as const, data: '2026-11-06T13:00:00Z', mensagem: 'Meio' },
    ]
    render(<TimelineStatus historico={historico} />)
    const itens = screen.getAllByRole('listitem')
    expect(itens[0]).toHaveTextContent('Início'); expect(itens[2]).toHaveTextContent('Fim')
    expect(historico[0].mensagem).toBe('Fim')
  })

  it('apresenta saída navegável para página inexistente', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/')
  })

  it('permite experimentar seleção e confirmação no catálogo de desenvolvimento', async () => {
    render(<MemoryRouter><DevUiPage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: 'LIXO' }))
    expect(screen.getByRole('button', { name: 'LIXO' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Abrir bottom sheet' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Abrir bottom sheet' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
