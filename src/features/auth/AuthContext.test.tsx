import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ApiProvider } from '../../services/api/ApiContext'
import { USUARIOS_SEED } from '../../services/api/mock/seed'
import { apiDeTeste } from '../../test/helpers'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { emitirSessaoInvalida } from '../../services/api/sessao'

const joana = USUARIOS_SEED[0]

function wrapper({ children }: { children: ReactNode }) {
  return (
    <ApiProvider api={apiDeTeste()}>
      <AuthProvider>{children}</AuthProvider>
    </ApiProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => window.localStorage.clear())

  it('começa carregando e termina sem sessão', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.carregando).toBe(true)
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.usuario).toBeNull()
  })

  it('login preenche o usuário; logout limpa; nova instância restaura a sessão', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.carregando).toBe(false))
    await act(() => result.current.login({ email: joana.email, senha: joana.senha }))
    expect(result.current.usuario?.nome).toBe(joana.nome)
    expect(result.current.ehAdmin).toBe(false)

    const { result: r2 } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(r2.current.usuario?.email).toBe(joana.email))

    await act(() => result.current.logout())
    expect(result.current.usuario).toBeNull()
  })

  it('cadastrar já deixa o usuário logado', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.carregando).toBe(false))
    await act(() => result.current.cadastrar({ nome: 'Novo', email: 'novo@x.com', senha: 'senha1234' }))
    expect(result.current.usuario?.email).toBe('novo@x.com')
  })

  it('ao receber aviso de sessão inválida, encerra a sessão', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.carregando).toBe(false))
    await act(() => result.current.login({ email: joana.email, senha: joana.senha }))
    expect(result.current.usuario).not.toBeNull()
    act(() => emitirSessaoInvalida())
    await waitFor(() => expect(result.current.usuario).toBeNull())
    expect(window.localStorage.getItem('zelar.sessao')).toBeNull()
  })
})
