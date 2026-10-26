import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { BottomSheet } from './BottomSheet'

describe('BottomSheet', () => {
  it('não renderiza nada fechado', () => {
    render(
      <BottomSheet aberto={false} aoFechar={() => {}} titulo="X">
        conteúdo
      </BottomSheet>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('aberto é um dialog com título e fecha no botão e no Escape', async () => {
    const aoFechar = vi.fn()
    render(
      <BottomSheet aberto aoFechar={aoFechar} titulo="Confirmar local">
        conteúdo
      </BottomSheet>,
    )
    expect(screen.getByRole('dialog', { name: 'Confirmar local' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(aoFechar).toHaveBeenCalledTimes(1)
    await userEvent.keyboard('{Escape}')
    expect(aoFechar).toHaveBeenCalledTimes(2)
  })

  it('move o foco para dentro ao abrir, prende o Tab e devolve ao gatilho ao fechar', async () => {
    function Demo() {
      const [aberto, setAberto] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setAberto(true)}>
            Abrir
          </button>
          <BottomSheet aberto={aberto} aoFechar={() => setAberto(false)} titulo="Painel">
            <button type="button">Primeiro</button>
            <button type="button">Último</button>
          </BottomSheet>
        </>
      )
    }
    render(<Demo />)
    const gatilho = screen.getByRole('button', { name: 'Abrir' })
    await userEvent.click(gatilho)
    const dialogo = screen.getByRole('dialog')
    expect(dialogo.contains(document.activeElement)).toBe(true)
    for (let i = 0; i < 4; i++) await userEvent.tab()
    expect(dialogo.contains(document.activeElement)).toBe(true)
    for (let i = 0; i < 5; i++) await userEvent.tab({ shift: true })
    expect(dialogo.contains(document.activeElement)).toBe(true)
    await userEvent.keyboard('{Escape}')
    expect(document.activeElement).toBe(gatilho)
  })
})
