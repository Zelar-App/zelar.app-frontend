import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('mostra o rótulo em português e expõe o status', () => {
    render(<StatusBadge status="EM_ANALISE" />)
    const badge = screen.getByText('Em análise')
    expect(badge).toHaveAttribute('data-status', 'EM_ANALISE')
  })
  it('usa a cor semântica de cada status', () => {
    const { rerender } = render(<StatusBadge status="ENVIADA" />)
    expect(screen.getByText('Enviada').className).toContain('text-primary')
    rerender(<StatusBadge status="RESOLVIDA" />)
    expect(screen.getByText('Resolvida').className).toContain('text-success')
  })
})
