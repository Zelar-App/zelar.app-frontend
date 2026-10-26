import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { TabBar } from './TabBar'

function renderEm(caminho: string) {
  return render(
    <MemoryRouter initialEntries={[caminho]}>
      <TabBar />
    </MemoryRouter>,
  )
}

describe('TabBar', () => {
  it('mostra as 5 abas do mockup na ordem', () => {
    renderEm('/')
    const links = screen.getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['Início', 'Mapa', 'Abrir Chamado', 'Histórico', 'Conta'])
  })

  it('marca a aba da rota atual como ativa', () => {
    renderEm('/mapa')
    expect(screen.getByRole('link', { name: 'Mapa' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current')
  })

  it('mantém a aba ativa em sub-rotas', () => {
    renderEm('/historico/abc')
    expect(screen.getByRole('link', { name: 'Histórico' })).toHaveAttribute('aria-current', 'page')
  })
})
