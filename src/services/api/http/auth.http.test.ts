import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { criarAuthHttp, tokenExpirado } from './auth.http'
import { criarClienteHttp } from './client'
import { aoSessaoInvalida } from '../sessao'

function jwt(payload: object): string {
  const b64url = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return [b64url({ alg: 'HS256', typ: 'JWT' }), b64url(payload), 'assinatura'].join('.')
}

describe('auth http', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('detecta expiração em JWT real (base64url, sem padding)', () => {
    expect(tokenExpirado(jwt({ sub: 'a', exp: Math.floor(Date.now() / 1000) - 60 }))).toBe(true)
    expect(tokenExpirado(jwt({ sub: 'a', exp: Math.floor(Date.now() / 1000) + 60 }))).toBe(false)
    expect(tokenExpirado('opaco')).toBe(false)
  })

  it('restaurarSessao descarta sessão com token expirado', async () => {
    window.localStorage.setItem('zelar.sessao', JSON.stringify({ token: jwt({ exp: 1 }), usuario: { id: 'a' } }))
    const http = criarClienteHttp({ baseUrl: 'http://api.local', obterToken: () => null })
    expect(await criarAuthHttp(http).restaurarSessao()).toBeNull()
    expect(window.localStorage.getItem('zelar.sessao')).toBeNull()
  })

  it('resposta 401 do backend avisa que a sessão é inválida', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }))
    const avisos: number[] = []
    const parar = aoSessaoInvalida(() => avisos.push(1))
    const http = criarClienteHttp({ baseUrl: 'http://api.local', obterToken: () => 'x' })
    await expect(http.get('/api/v1/ocorrencias')).rejects.toMatchObject({ status: 401 })
    expect(avisos).toHaveLength(1)
    parar()
  })
})
