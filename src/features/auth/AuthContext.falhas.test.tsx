import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessaoAuth } from '../../domain/types'
import { ApiProvider } from '../../services/api/ApiContext'
import { getApi } from '../../services/api'
import { useApi } from '../../services/api/useApi'
import { apiDeTeste } from '../../test/helpers'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

afterEach(() => vi.restoreAllMocks())

describe('limites dos providers de sessão', () => {
  it('informa uso de autenticação fora do provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/)
  })

  it('sem provider de API utiliza a mesma instância do ambiente', () => {
    const { result } = renderHook(() => useApi())
    expect(result.current).toBe(getApi())
    expect(getApi()).toBe(result.current)
  })

  it('termina restauração com falha sem deixar carregamento preso', async () => {
    const api = apiDeTeste()
    vi.spyOn(api.auth, 'restaurarSessao').mockRejectedValue(new Error('Rede'))
    const wrapper = ({ children }: { children: ReactNode }) => <ApiProvider api={api}><AuthProvider>{children}</AuthProvider></ApiProvider>
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.usuario).toBeNull()
  })

  it.each(['sucesso', 'falha'])('ignora restauração com %s após desmontagem', async (tipo) => {
    const api = apiDeTeste()
    let resolver!: (sessao: SessaoAuth | null) => void
    let rejeitar!: (erro: Error) => void
    const pendente = new Promise<SessaoAuth | null>((ok, falha) => { resolver = ok; rejeitar = falha })
    vi.spyOn(api.auth, 'restaurarSessao').mockReturnValue(pendente)
    const logout = vi.spyOn(api.auth, 'logout')
    const wrapper = ({ children }: { children: ReactNode }) => <ApiProvider api={api}><AuthProvider>{children}</AuthProvider></ApiProvider>
    const { unmount } = renderHook(() => useAuth(), { wrapper })
    unmount()
    await act(async () => { if (tipo === 'sucesso') resolver(null); else rejeitar(new Error('Tardia')) })
    expect(logout).not.toHaveBeenCalled()
  })
})
