import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { AuthProvider } from '../features/auth/AuthContext'
import type { Api } from '../services/api/contracts'
import { criarApi } from '../services/api'
import { ApiProvider } from '../services/api/ApiContext'

export function apiDeTeste(): Api {
  return criarApi({ apiMode: 'mock', apiBaseUrl: 'http://x', mapCenter: [-19.9167, -43.9345] })
}

export interface OpcoesRender extends Omit<RenderOptions, 'wrapper'> {
  api?: Api
  rota?: string
  rotas?: RouteObject[]
}

/** Renderiza com ApiProvider + AuthProvider + roteador em memória. */
export function renderComProviders(ui: ReactElement, { api = apiDeTeste(), rota = '/', rotas, ...opts }: OpcoesRender = {}) {
  const router = createMemoryRouter(rotas ?? [{ path: '*', element: ui }], { initialEntries: [rota] })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ApiProvider api={api}>
      <AuthProvider>{children}</AuthProvider>
    </ApiProvider>
  )
  const resultado = render(<RouterProvider router={router} />, { wrapper: Wrapper, ...opts })
  return { ...resultado, router, api }
}
