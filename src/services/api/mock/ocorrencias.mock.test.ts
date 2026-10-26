import { beforeEach, describe, expect, it } from 'vitest'
import { criarAuthMock } from './auth.mock'
import { criarOcorrenciasMock } from './ocorrencias.mock'
import { USUARIOS_SEED } from './seed'

const joana = USUARIOS_SEED[0]
const admin = USUARIOS_SEED[1]

async function logar(u: { email: string; senha: string }) {
  await criarAuthMock().login(u)
}

const nova = () => ({
  categoria: 'BURACO' as const,
  descricao: 'Buraco grande na esquina',
  localizacao: { latitude: -19.92, longitude: -43.93, enderecoAproximado: 'Rua A, 10' },
})

describe('ocorrencias mock', () => {
  beforeEach(() => window.localStorage.clear())

  it('cidadão cria ocorrência que nasce ENVIADA com histórico inicial e persiste', async () => {
    await logar(joana)
    const repo = criarOcorrenciasMock()
    const o = await repo.criar(nova())
    expect(o).toMatchObject({ status: 'ENVIADA', usuarioId: joana.id, categoria: 'BURACO', prioridade: null })
    expect(o.historico).toHaveLength(1)
    expect(o.historico[0]).toMatchObject({ status: 'ENVIADA', mensagem: 'Sua solicitação foi enviada com sucesso' })
    const lida = await criarOcorrenciasMock().buscarPorId(o.id)
    expect(lida.descricao).toBe('Buraco grande na esquina')
  })

  it('converte a foto com o conversor injetado', async () => {
    await logar(joana)
    const repo = criarOcorrenciasMock({ converterFoto: async () => 'data:image/jpeg;base64,abc' })
    const o = await repo.criar({ ...nova(), foto: new File(['x'], 'f.jpg', { type: 'image/jpeg' }) })
    expect(o.fotoUrl).toBe('data:image/jpeg;base64,abc')
  })

  it('cidadão lista só as próprias; admin lista todas', async () => {
    await logar(joana)
    const minhas = await criarOcorrenciasMock().listar()
    expect(minhas.length).toBeGreaterThan(0)
    expect(minhas.every((o) => o.usuarioId === joana.id)).toBe(true)
    await logar(admin)
    const todas = await criarOcorrenciasMock().listar()
    expect(todas.length).toBeGreaterThan(minhas.length)
  })

  it('lista ordenada da mais recente para a mais antiga e filtra por status', async () => {
    await logar(admin)
    const repo = criarOcorrenciasMock()
    const todas = await repo.listar()
    for (let i = 1; i < todas.length; i++) expect(todas[i - 1].criadoEm >= todas[i].criadoEm).toBe(true)
    const resolvidas = await repo.listar({ status: 'RESOLVIDA' })
    expect(resolvidas.length).toBeGreaterThan(0)
    expect(resolvidas.every((o) => o.status === 'RESOLVIDA')).toBe(true)
  })

  it('cidadão não pode atualizar (403)', async () => {
    await logar(joana)
    const repo = criarOcorrenciasMock()
    const [o] = await repo.listar({ status: 'ENVIADA' })
    await expect(repo.atualizar(o.id, { status: 'EM_ANALISE' })).rejects.toMatchObject({ status: 403 })
  })

  it('admin avança status com histórico e prioridade; transição inválida dá 422', async () => {
    await logar(admin)
    const repo = criarOcorrenciasMock()
    const [o] = await repo.listar({ status: 'ENVIADA' })
    const atual = await repo.atualizar(o.id, { status: 'EM_ANALISE', prioridade: 'ALTA' })
    expect(atual).toMatchObject({ status: 'EM_ANALISE', prioridade: 'ALTA' })
    expect(atual.historico.at(-1)).toMatchObject({ status: 'EM_ANALISE', mensagem: 'O órgão responsável foi acionado' })
    expect(atual.atualizadoEm > o.atualizadoEm).toBe(true)
    await expect(repo.atualizar(o.id, { status: 'ENVIADA' })).rejects.toMatchObject({ status: 422 })
  })

  it('sem sessão responde 401; id inexistente 404', async () => {
    await expect(criarOcorrenciasMock().listar()).rejects.toMatchObject({ status: 401 })
    await logar(admin)
    await expect(criarOcorrenciasMock().buscarPorId('nao-existe')).rejects.toMatchObject({ status: 404 })
  })

  it('indicadores batem com a lista visível', async () => {
    await logar(admin)
    const repo = criarOcorrenciasMock()
    const todas = await repo.listar()
    const ind = await repo.indicadores()
    expect(ind.totalOcorrencias).toBe(todas.length)
    expect(ind.totalEnviadas + ind.totalEmAnalise + ind.totalResolvidas).toBe(todas.length)
  })
})
