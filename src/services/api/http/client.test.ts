import { afterEach, describe, expect, it, vi } from 'vitest'
import { criarClienteHttp } from './client'
import { ApiError } from '../errors'

describe('cliente http', () => {
  afterEach(() => vi.restoreAllMocks())

  it('monta URL com base, envia JSON e Bearer quando há token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 201, headers: { 'content-type': 'application/json' } }),
    )
    const http = criarClienteHttp({ baseUrl: 'http://api.local', obterToken: () => 'abc' })
    const r = await http.post<{ ok: boolean }>('/api/v1/usuarios', { nome: 'x' })
    expect(r).toEqual({ ok: true })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.local/api/v1/usuarios')
    expect(init?.method).toBe('POST')
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer abc')
    expect(new Headers(init?.headers).get('content-type')).toBe('application/json')
    expect(init?.body).toBe(JSON.stringify({ nome: 'x' }))
  })

  it('converte erro do backend em ApiError com a mensagem', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ status: 409, erro: 'Conflict', mensagem: 'E-mail já cadastrado', caminho: '/api/v1/usuarios' }),
        { status: 409, headers: { 'content-type': 'application/json' } },
      ),
    )
    const http = criarClienteHttp({ baseUrl: 'http://api.local', obterToken: () => null })
    const erro = await http.post('/api/v1/usuarios', {}).catch((e) => e)
    expect(erro).toBeInstanceOf(ApiError)
    expect(erro).toMatchObject({ status: 409, mensagem: 'E-mail já cadastrado' })
  })

  it('falha de rede vira ApiError status 0 com mensagem amigável', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    const http = criarClienteHttp({ baseUrl: 'http://api.local', obterToken: () => null })
    await expect(http.get('/x')).rejects.toMatchObject({ status: 0, mensagem: expect.stringContaining('conectar') })
  })
})
