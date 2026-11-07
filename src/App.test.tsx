import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { router } from './app/router'

describe('entrada da aplicação e rotas reais', () => {
  afterEach(async () => { cleanup(); vi.unstubAllEnvs(); await act(async () => { await router.navigate('/login') }) })

  it('protege histórico sem sessão e apresenta login através dos provedores reais', async () => {
    localStorage.clear()
    await router.navigate('/historico')
    render(<App />)
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('apresenta página inexistente pela tabela real de rotas', async () => {
    await router.navigate('/rota-inexistente')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument()
  })

  it('omite catálogo de desenvolvimento ao preparar rotas de produção', async () => {
    vi.stubEnv('DEV', false)
    vi.resetModules()
    const producao = await import('./app/router')
    expect(producao.rotas.some((rota) => rota.path === '/dev/ui')).toBe(false)
    expect(producao.rotas.some((rota) => rota.path === '/admin')).toBe(true)
    producao.router.dispose()
  })
})
