import { useContext } from 'react'
import { AuthContext, type AuthValor } from './authContexto'

export function useAuth(): AuthValor {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
