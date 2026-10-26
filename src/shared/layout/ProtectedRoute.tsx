import { Navigate, Outlet, useLocation } from 'react-router'
import type { Perfil } from '../../domain/types'
import { useAuth } from '../../features/auth/useAuth'
import { Spinner } from '../ui'

/** Exige sessão; com `perfil`, exige também aquele papel (cidadão cai no início). */
export function ProtectedRoute({ perfil }: { perfil?: Perfil }) {
  const { usuario, carregando } = useAuth()
  const location = useLocation()

  if (carregando) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-primary">
        <Spinner className="size-8" />
      </div>
    )
  }
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />
  if (perfil && usuario.perfil !== perfil) return <Navigate to="/" replace />
  return <Outlet />
}
