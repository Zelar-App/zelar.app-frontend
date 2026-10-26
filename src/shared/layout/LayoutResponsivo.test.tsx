import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PageHeader } from '../ui/PageHeader'
import { AdminShell } from './AdminShell'
import { AppShell } from './AppShell'

describe('layouts responsivos e cabeçalhos', () => {
  it('PageHeader navega para o destino configurado no botão Voltar', async () => {
    const router = createMemoryRouter(
      [
        { path: '/detalhe', element: <PageHeader titulo="Detalhe" subtitulo="Informações" voltar="/lista" /> },
        { path: '/lista', element: <h1>Lista</h1> },
      ],
      { initialEntries: ['/detalhe'] },
    )
    render(<RouterProvider router={router} />)

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(await screen.findByRole('heading', { name: 'Lista' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/lista')
  })

  it('AppShell limita a largura do conteúdo e mantém a navegação principal', () => {
    const router = createMemoryRouter(
      [{ element: <AppShell />, children: [{ path: '/', element: <p>Conteúdo cidadão</p> }] }],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={router} />)

    expect(screen.getByRole('main')).toHaveClass('max-w-[1440px]')
    expect(screen.getByRole('main')).toHaveClass('pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom))]')
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    expect(screen.getByText('Conteúdo cidadão')).toBeInTheDocument()
  })

  it('AdminShell oferece cabeçalho móvel e sidebar para desktop', () => {
    const router = createMemoryRouter(
      [{ path: '/admin', element: <AdminShell />, children: [{ index: true, element: <p>Conteúdo administrativo</p> }] }],
      { initialEntries: ['/admin'] },
    )
    const { container } = render(<RouterProvider router={router} />)

    expect(screen.getByRole('banner')).toHaveClass('desktop:hidden')
    expect(container.querySelector('aside')).toHaveClass('hidden', 'desktop:flex')
    expect(screen.getByRole('navigation', { name: 'Navegação administrativa' })).toBeInTheDocument()
    expect(screen.getByText('Conteúdo administrativo')).toBeInTheDocument()
  })
})
