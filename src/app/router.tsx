import { createBrowserRouter } from 'react-router'
import AdminPage from '../features/admin/pages/AdminPage'
import CadastroPage from '../features/auth/pages/CadastroPage'
import LoginPage from '../features/auth/pages/LoginPage'
import ContaPage from '../features/conta/pages/ContaPage'
import HomePage from '../features/home/pages/HomePage'
import MapaPage from '../features/mapa/pages/MapaPage'
import AbrirChamadoPage from '../features/ocorrencias/pages/AbrirChamadoPage'
import DetalheOcorrenciaPage from '../features/ocorrencias/pages/DetalheOcorrenciaPage'
import FormularioChamadoPage from '../features/ocorrencias/pages/FormularioChamadoPage'
import HistoricoPage from '../features/ocorrencias/pages/HistoricoPage'
import { AdminShell } from '../shared/layout/AdminShell'
import { AppShell } from '../shared/layout/AppShell'
import { ProtectedRoute } from '../shared/layout/ProtectedRoute'
import NotFoundPage from '../shared/pages/NotFoundPage'
import DevUiPage from '../shared/pages/DevUiPage'

import type { RouteObject } from 'react-router'

export const rotas: RouteObject[] = [
  { path: '/login', Component: LoginPage },
  { path: '/cadastro', Component: CadastroPage },
  {
    Component: ProtectedRoute,
    children: [
      {
        Component: AppShell,
        children: [
          { index: true, Component: HomePage },
          { path: 'mapa', Component: MapaPage },
          { path: 'abrir-chamado', Component: AbrirChamadoPage },
          { path: 'abrir-chamado/formulario', Component: FormularioChamadoPage },
          { path: 'historico', Component: HistoricoPage },
          { path: 'historico/:id', Component: DetalheOcorrenciaPage },
          { path: 'conta', Component: ContaPage },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute perfil="ADMINISTRADOR" />,
    children: [{ Component: AdminShell, children: [{ index: true, Component: AdminPage }] }],
  },
  ...(import.meta.env.DEV ? [{ path: '/dev/ui', Component: DevUiPage }] : []),
  { path: '*', Component: NotFoundPage },
]

export const router = createBrowserRouter(rotas)
