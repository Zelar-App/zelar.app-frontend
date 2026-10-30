import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { criarAuthHttp, lerTokenHttp } from './auth.http'
import { criarClienteHttp } from './client'
import { criarOcorrenciasHttp } from './ocorrencias.http'

// Formatos dos records Java de develop (5e5abf4); indicadores da BE-15 (#83).
const usuario = { id: 'u1', nome: 'Pessoa', email: 'pessoa@example.test', perfil: 'ADMINISTRADOR', telefone: null, criadoEm: '2026-10-20T10:00:00' }
const dto = (id = 'o1', extra: Record<string, unknown> = {}) => ({
  id, usuarioId: usuario.id, categoria: 'BURACO', descricao: 'Buraco na via', latitude: -19.92, longitude: -43.93,
  enderecoAproximado: 'Praça Sete', status: 'ENVIADA', prioridade: null,
  dataCriacao: '2026-10-20T11:00:00', dataAtualizacao: '2026-10-20T12:00:00', ...extra,
})
const pagina = (conteudo: ReturnType<typeof dto>[], numero = 0, total = 1) => ({ conteudo, pagina: numero, tamanho: 100, totalElementos: 3, totalPaginas: total })
const resposta = (dados: unknown, status = 200) => new Response(JSON.stringify(dados), { status, headers: { 'content-type': 'application/json' } })
const repositorios = () => {
  const http = criarClienteHttp({ baseUrl: 'http://api.local', obterToken: lerTokenHttp })
  return { auth: criarAuthHttp(http), ocorrencias: criarOcorrenciasHttp(http) }
}

describe('contratos HTTP do backend Java', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('faz login com accessToken, consulta autenticada e altera prioridade/status pelos dois PATCHs', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(resposta({ accessToken: 'jwt-do-backend', tokenType: 'Bearer', expiresIn: 3600, usuario }))
      .mockResolvedValueOnce(resposta(pagina([dto()])))
      .mockResolvedValueOnce(resposta(dto('o1', { prioridade: 'ALTA' })))
      .mockResolvedValueOnce(resposta(dto('o1', { prioridade: 'ALTA', status: 'EM_ANALISE' })))
    const { auth, ocorrencias } = repositorios()
    expect((await auth.login({ email: usuario.email, senha: 'senha-teste' })).token).toBe('jwt-do-backend')
    const [item] = await ocorrencias.listar()
    expect(item).toMatchObject({ localizacao: { latitude: -19.92, longitude: -43.93 }, criadoEm: dto().dataCriacao })
    expect(await ocorrencias.atualizar(item.id, { prioridade: 'ALTA', status: 'EM_ANALISE' })).toMatchObject({ prioridade: 'ALTA', status: 'EM_ANALISE' })
    expect(fetchMock.mock.calls.slice(1).every(([, init]) => new Headers(init?.headers).get('authorization') === 'Bearer jwt-do-backend')).toBe(true)
    expect(fetchMock.mock.calls.slice(2).map(([url, init]) => [String(url), init?.method, JSON.parse(String(init?.body))])).toEqual([
      ['http://api.local/api/v1/ocorrencias/o1/prioridade', 'PATCH', { prioridade: 'ALTA' }],
      ['http://api.local/api/v1/ocorrencias/o1/status', 'PATCH', { status: 'EM_ANALISE' }],
    ])
  })

  it('consome todas as páginas do envelope conteudo e aplica os filtros não suportados pelo servidor', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(resposta(pagina([dto('antiga')], 0, 2)))
      .mockResolvedValueOnce(resposta(pagina([dto('lixo', { categoria: 'LIXO' }), dto('nova', { dataCriacao: '2026-10-21T11:00:00' })], 1, 2)))
    const itens = await repositorios().ocorrencias.listar({ status: 'ENVIADA', categoria: 'BURACO', usuarioId: 'u1' })
    expect(itens.map((item) => item.id)).toEqual(['nova', 'antiga'])
    expect(fetchMock.mock.calls.map(([url]) => new URL(String(url)).searchParams.get('pagina'))).toEqual(['0', '1'])
    for (const [url] of fetchMock.mock.calls) {
      const query = new URL(String(url)).searchParams
      expect(query.get('tamanho')).toBe('100')
      expect(query.get('status')).toBe('ENVIADA')
    }
  })

  it('converte coordenadas e datas ao criar, buscar e atualizar uma ocorrência', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => resposta(dto()))
    const repo = repositorios().ocorrencias
    const resultados = [
      await repo.criar({ categoria: 'BURACO', descricao: 'Buraco na via', localizacao: { latitude: -19.92, longitude: -43.93 } }),
      await repo.buscarPorId('o1'),
      await repo.atualizar('o1', { status: 'EM_ANALISE' }),
    ]
    for (const item of resultados) {
      expect(item.localizacao).toEqual({ latitude: -19.92, longitude: -43.93, enderecoAproximado: 'Praça Sete' })
      expect(item.criadoEm).toBe(dto().dataCriacao)
      expect(item.atualizadoEm).toBe(dto().dataAtualizacao)
      expect(item.historico[0].data).toBe(dto().dataCriacao)
    }
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({ latitude: -19.92, longitude: -43.93 })
    expect(fetchMock.mock.calls[2][1]?.method).toBe('PATCH')
  })

  it('converte os indicadores da BE-15 e calcula o total', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta({ enviadas: 2, emAnalise: 3, resolvidas: 5 }))
    expect(await repositorios().ocorrencias.indicadores()).toEqual({ totalEnviadas: 2, totalEmAnalise: 3, totalResolvidas: 5, totalOcorrencias: 10 })
  })

  it('informa falha parcial quando prioridade foi salva e a alteração de status falhou', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(resposta(dto('o1', { prioridade: 'ALTA' })))
      .mockResolvedValueOnce(resposta({ mensagem: 'Transição não permitida' }, 409))
    await expect(repositorios().ocorrencias.atualizar('o1', { prioridade: 'ALTA', status: 'RESOLVIDA' }))
      .rejects.toMatchObject({ status: 409, mensagem: expect.stringMatching(/prioridade.*salva.*status/i) })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('revalida a sessão em auth/me e atualiza o perfil salvo', async () => {
    window.localStorage.setItem('zelar.sessao', JSON.stringify({ token: 'opaco', usuario: { ...usuario, perfil: 'CIDADAO' } }))
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta(usuario))
    expect(await repositorios().auth.restaurarSessao()).toEqual({ token: 'opaco', usuario })
    expect(String(fetchMock.mock.calls[0][0])).toBe('http://api.local/api/v1/auth/me')
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('authorization')).toBe('Bearer opaco')
  })

  it('descarta a sessão recusada pelo backend', async () => {
    window.localStorage.setItem('zelar.sessao', JSON.stringify({ token: 'opaco', usuario }))
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta({ mensagem: 'Sessão expirada' }, 401))
    expect(await repositorios().auth.restaurarSessao()).toBeNull()
    expect(window.localStorage.getItem('zelar.sessao')).toBeNull()
  })

  it('cria o chamado e envia a fotografia autenticada no endpoint multipart separado', async () => {
    window.localStorage.setItem('zelar.sessao', JSON.stringify({ token: 'jwt', usuario }))
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(resposta(dto())).mockResolvedValueOnce(resposta({ id: 'anexo' }, 201))
    const foto = new File(['foto'], 'foto.jpg', { type: 'image/jpeg' })
    const criada = await repositorios().ocorrencias.criar({ categoria: 'BURACO', descricao: 'Buraco', localizacao: { latitude: 1, longitude: 2 }, foto })
    expect(criada).toMatchObject({ id: 'o1', possuiFotografia: true })
    const [url, init] = fetchMock.mock.calls[1]
    expect(url).toBe('http://api.local/api/v1/ocorrencias/o1/fotografia')
    expect(init?.body).toBeInstanceOf(FormData)
    const form = init!.body as FormData
    expect(form.get('foto')).toBe(foto)
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer jwt')
    expect(new Headers(init?.headers).has('content-type')).toBe(false)
  })

  it('preserva o chamado criado e informa a falha da foto sem convidar à duplicação', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(resposta(dto())).mockResolvedValueOnce(resposta({ mensagem: 'Storage indisponível' }, 503))
    const criada = await repositorios().ocorrencias.criar({ categoria: 'BURACO', descricao: 'Buraco', localizacao: { latitude: 1, longitude: 2 }, foto: new File(['foto'], 'foto.jpg', { type: 'image/jpeg' }) })
    expect(criada).toMatchObject({ id: 'o1', avisoFotografia: expect.stringMatching(/chamado.*criado.*foto/i) })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('baixa os bytes da fotografia com Bearer e permite repetir só o upload', async () => {
    window.localStorage.setItem('zelar.sessao', JSON.stringify({ token: 'jwt', usuario }))
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('jpeg-bytes', { headers: { 'content-type': 'image/jpeg' } })).mockResolvedValueOnce(resposta({ id: 'foto' }, 201))
    const repo = repositorios().ocorrencias
    const imagem = await repo.buscarFotografia!('o1')
    expect(await imagem.text()).toBe('jpeg-bytes')
    expect(imagem.type).toBe('image/jpeg')
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('authorization')).toBe('Bearer jwt')
    await repo.enviarFotografia!('o1', new File(['x'], 'a.jpg', { type: 'image/jpeg' }))
    expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual(['GET', 'POST'])
  })

  it('rejeita envelope inválido com erro legível, sem retornar uma lista parcial', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(resposta({ content: [] }))
    await expect(repositorios().ocorrencias.listar()).rejects.toMatchObject({ status: 502 })
  })

  it('calcula indicadores com todas as páginas quando o endpoint responde 404', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(resposta({ mensagem: 'Não encontrado' }, 404))
      .mockResolvedValueOnce(resposta(pagina([dto('a')], 0, 2)))
      .mockResolvedValueOnce(resposta(pagina([dto('b', { status: 'RESOLVIDA' })], 1, 2)))
    expect(await repositorios().ocorrencias.indicadores()).toEqual({ totalEnviadas: 1, totalEmAnalise: 0, totalResolvidas: 1, totalOcorrencias: 2 })
  })
})
