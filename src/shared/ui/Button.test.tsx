import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('dispara onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Enviar</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('em carregando fica desabilitado, com aria-busy e não dispara onClick', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} carregando>
        Enviar
      </Button>,
    )
    const botao = screen.getByRole('button')
    expect(botao).toBeDisabled()
    expect(botao).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(botao)
    expect(onClick).not.toHaveBeenCalled()
  })
})
