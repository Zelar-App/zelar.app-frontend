import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CadastroInput, LoginInput, Usuario } from '../../domain/types'
import { aoSessaoInvalida } from '../../services/api/sessao'
import { useApi } from '../../services/api/useApi'
import { AuthContext, type AuthValor } from './authContexto'

export function AuthProvider({ children }: { children: ReactNode }) {
  const api = useApi()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    api.auth
      .restaurarSessao()
      .then((s) => ativo && setUsuario(s?.usuario ?? null))
      .catch(() => ativo && setUsuario(null))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [api])

  const login = useCallback(
    async (input: LoginInput) => {
      const sessao = await api.auth.login(input)
      setUsuario(sessao.usuario)
    },
    [api],
  )

  const cadastrar = useCallback(
    async (input: CadastroInput) => {
      await api.auth.cadastrar(input)
      const sessao = await api.auth.login({ email: input.email, senha: input.senha })
      setUsuario(sessao.usuario)
    },
    [api],
  )

  const logout = useCallback(async () => {
    await api.auth.logout()
    setUsuario(null)
  }, [api])

  // 401 em qualquer chamada (token expirado/inválido) encerra a sessão; o ProtectedRoute manda ao login.
  useEffect(() => aoSessaoInvalida(() => void logout()), [logout])

  const valor = useMemo<AuthValor>(
    () => ({ usuario, carregando, ehAdmin: usuario?.perfil === 'ADMINISTRADOR', login, cadastrar, logout }),
    [usuario, carregando, login, cadastrar, logout],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
