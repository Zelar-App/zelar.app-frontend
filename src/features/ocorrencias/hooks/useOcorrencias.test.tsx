import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ApiProvider } from '../../../services/api/ApiContext'
import { USUARIOS_SEED } from '../../../services/api/mock/seed'
import { apiDeTeste } from '../../../test/helpers'
import { useOcorrencias } from './useOcorrencias'

describe('useOcorrencias', () => {
  beforeEach(() => window.localStorage.clear())

  it('carrega a lista do usuário logado e recarrega sob demanda', async () => {
    const api = apiDeTeste()
    await api.auth.login({ email: USUARIOS_SEED[0].email, senha: USUARIOS_SEED[0].senha })
    const wrapper = ({ children }: { children: ReactNode }) => <ApiProvider api={api}>{children}</ApiProvider>
    const { result } = renderHook(() => useOcorrencias(), { wrapper })
    expect(result.current.carregando).toBe(true)
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.lista.length).toBe(5)
    expect(result.current.erro).toBeNull()

    await api.ocorrencias.criar({ categoria: 'LIXO', descricao: 'x', localizacao: { latitude: 0, longitude: 0 } })
    await act(() => result.current.recarregar())
    expect(result.current.lista.length).toBe(6)
  })

  it('expõe o erro da API', async () => {
    const api = apiDeTeste() // sem login → 401
    const wrapper = ({ children }: { children: ReactNode }) => <ApiProvider api={api}>{children}</ApiProvider>
    const { result } = renderHook(() => useOcorrencias(), { wrapper })
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.erro).toBe('Faça login para continuar')
  })
})
