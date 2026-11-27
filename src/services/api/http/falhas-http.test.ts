import { afterEach, describe, expect, it, vi } from 'vitest'
import { criarClienteHttp } from './client'
import { criarAuthHttp, lerTokenHttp, tokenExpirado } from './auth.http'
import { criarOcorrenciasHttp } from './ocorrencias.http'
import { ApiError } from '../errors'

afterEach(() => { vi.restoreAllMocks(); window.localStorage.clear() })
const cliente = () => criarClienteHttp({ baseUrl: 'http://api.local/', obterToken: () => null })
const resposta = (dados: unknown, status = 200) => new Response(JSON.stringify(dados), { status })
const dto = { id: 'o1', usuarioId: 'u1', categoria: 'BURACO', descricao: 'Buraco', latitude: 0, longitude: 0, status: 'ENVIADA', prioridade: null, dataCriacao: '2026-11-06T12:00:00Z' }

describe('falhas e fronteiras do cliente HTTP', () => {
  it('suporta PUT, corpo vazio, texto e no-content sem interpretar JSON inexistente', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('texto')).mockResolvedValueOnce(new Response('')).mockResolvedValueOnce(new Response(null, { status: 204 }))
    const http = cliente()
    await expect(http.put('/x', { x: 1 })).resolves.toBe('texto')
    await expect(http.get('/x')).resolves.toBeUndefined()
    await expect(http.post('/x')).resolves.toBeUndefined()
    expect(fetch.mock.calls[0][1]?.method).toBe('PUT')
    expect(new Headers(fetch.mock.calls[0][1]?.headers).get('authorization')).toBeNull()
  })

  it.each([[401, /Sessão inválida/], [403, /permissão/], [500, /Erro 500/]])('fornece mensagem segura para erro %s sem JSON útil', async (status, mensagem) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Falha do proxy', { status: status as number }))
    await expect(cliente().get('/x')).rejects.toMatchObject({ mensagem: expect.stringMatching(mensagem as RegExp) })
  })

  it('preserva metadados do erro e trata corpo nulo', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(resposta({ mensagem: 'Inválido', erro: 'Bad Request', caminho: '/backend', timestamp: 'agora' }, 400)).mockResolvedValueOnce(resposta(null, 502))
    await expect(cliente().patch('/x', {})).rejects.toMatchObject({ caminho: '/backend', timestamp: 'agora', erro: 'Bad Request' })
    await expect(cliente().get('/x')).rejects.toMatchObject({ status: 502 })
  })

  it('não mantém Content-Type JSON ao enviar FormData', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta({ ok: true }))
    const form = new FormData(); form.append('foto', new Blob(['x']))
    await cliente().postForm('/foto', form)
    expect(fetch.mock.calls[0][1]?.body).toBe(form)
    expect(new Headers(fetch.mock.calls[0][1]?.headers).has('content-type')).toBe(false)
  })

  it('valida resposta do login e remove sessão local ao sair', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(resposta({ usuario: {} })).mockResolvedValueOnce(resposta({ accessToken: 'x' }))
    const auth = criarAuthHttp(cliente())
    await expect(auth.login({ email: 'a@b.com', senha: 'senha' })).rejects.toMatchObject({ status: 502 })
    await expect(auth.login({ email: 'a@b.com', senha: 'senha' })).rejects.toMatchObject({ status: 502 })
    window.localStorage.setItem('zelar.sessao', '{inválido')
    expect(lerTokenHttp()).toBeNull()
    await auth.logout()
    expect(lerTokenHttp()).toBeNull()
    expect(tokenExpirado('opaco')).toBe(false)
    expect(tokenExpirado('x.' + btoa('{}'))).toBe(false)
  })

  it('não restaura token expirado nem oculta indisponibilidade do servidor', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
    const auth = criarAuthHttp(cliente())
    window.localStorage.setItem('zelar.sessao', JSON.stringify({ token: 'x.' + btoa(JSON.stringify({ exp: 1 })) }))
    await expect(auth.restaurarSessao()).resolves.toBeNull()
    expect(fetch).not.toHaveBeenCalled()
    window.localStorage.setItem('zelar.sessao', JSON.stringify({ token: 'opaco' }))
    fetch.mockRejectedValueOnce(new Error('Rede'))
    await expect(auth.restaurarSessao()).rejects.toMatchObject({ status: 0 })
    expect(lerTokenHttp()).toBe('opaco')
    fetch.mockResolvedValueOnce(resposta({}, 403))
    await expect(auth.restaurarSessao()).resolves.toBeNull()
  })

  it('envia telefone no cadastro e omite quando vazio', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => resposta({ id: 'u1' }))
    const auth = criarAuthHttp(cliente())
    await auth.cadastrar({ nome: 'Pessoa', email: 'a@b.com', senha: 'Senha123', telefone: '123' })
    await auth.cadastrar({ nome: 'Pessoa', email: 'a@b.com', senha: 'Senha123' })
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body)).telefone).toBe('123')
    expect(JSON.parse(String(fetch.mock.calls[1][1]?.body))).not.toHaveProperty('telefone')
  })

  it.each([{ conteudo: [], pagina: 1, totalPaginas: 1 }, { conteudo: [], pagina: 0, totalPaginas: 1.5 }, { conteudo: [], pagina: 0, totalPaginas: -1 }])('recusa envelopes de paginação incoerentes', async (pagina) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta(pagina))
    await expect(criarOcorrenciasHttp(cliente()).listar()).rejects.toMatchObject({ status: 502 })
  })

  it('mantém histórico recebido e consulta atual quando não há alteração solicitada', async () => {
    const historico = [{ status: 'ENVIADA', data: dto.dataCriacao, mensagem: 'Recebido' }]
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta({ ...dto, historico }))
    const valor = await criarOcorrenciasHttp(cliente()).atualizar('o/1', {})
    expect(valor.historico).toEqual(historico)
    expect(String(fetch.mock.calls[0][0])).toContain('o%2F1')
    expect(fetch.mock.calls[0][1]?.method).toBe('GET')
  })

  it('não mascara erro de status isolado e distingue falha parcial sem ApiError', async () => {
    const http = cliente()
    const repo = criarOcorrenciasHttp(http)
    vi.spyOn(http, 'patch').mockRejectedValueOnce(new Error('Falha de status'))
    await expect(repo.atualizar('o1', { status: 'EM_ANALISE' })).rejects.toThrow('Falha de status')
    vi.mocked(http.patch).mockResolvedValueOnce(dto).mockRejectedValueOnce(new Error('Rede'))
    await expect(repo.atualizar('o1', { prioridade: 'ALTA', status: 'EM_ANALISE' })).rejects.toMatchObject({ status: 0, mensagem: expect.stringContaining('prioridade foi salva') })
  })

  it.each([new ApiError(403, 'Negado'), new Error('Rede')])('não calcula indicadores por fallback para falha diferente de 404', async (erro) => {
    const http = cliente(); vi.spyOn(http, 'get').mockRejectedValue(erro)
    await expect(criarOcorrenciasHttp(http).indicadores()).rejects.toBe(erro)
  })
})
