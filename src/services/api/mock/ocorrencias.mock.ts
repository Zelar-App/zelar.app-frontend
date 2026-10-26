import type {
  AtualizarOcorrenciaInput,
  FiltroOcorrencias,
  Indicadores,
  NovaOcorrenciaInput,
  Ocorrencia,
} from '../../../domain/types'
import { calcularIndicadores } from '../../../domain/ocorrencias/indicadores'
import { mensagemPorStatus } from '../../../domain/ocorrencias/mensagens'
import { podeTransitar } from '../../../domain/ocorrencias/transicoes'
import { agoraIso } from '../../../shared/lib/datas'
import { gerarId } from '../../../shared/lib/id'
import { lerComoDataUrl } from '../../../shared/lib/imagem'
import type { OcorrenciaRepository } from '../contracts'
import { ApiError } from '../errors'
import { emitirSessaoInvalida } from '../sessao'
import { lerSessaoSalva } from './auth.mock'
import { carregarDb, salvarDb } from './db'
import { atraso } from './delay'

export interface OpcoesOcorrenciasMock {
  converterFoto?: (arquivo: File) => Promise<string>
}

/** Limite de fotos guardadas no localStorage (≈ 5 MB no total). */
const MAX_FOTOS = 20
const CAMINHO = '/api/v1/ocorrencias'

function exigirSessao() {
  const sessao = lerSessaoSalva()
  if (!sessao) {
    emitirSessaoInvalida()
    throw new ApiError(401, 'Faça login para continuar', { caminho: CAMINHO })
  }
  return sessao
}

function aplicarFiltro(lista: Ocorrencia[], filtro: FiltroOcorrencias = {}): Ocorrencia[] {
  return lista.filter(
    (o) =>
      (!filtro.status || o.status === filtro.status) &&
      (!filtro.prioridade || o.prioridade === filtro.prioridade) &&
      (!filtro.categoria || o.categoria === filtro.categoria) &&
      (!filtro.usuarioId || o.usuarioId === filtro.usuarioId),
  )
}

function visiveisPara(db: ReturnType<typeof carregarDb>, perfil: string, usuarioId: string): Ocorrencia[] {
  const base = perfil === 'ADMINISTRADOR' ? db.ocorrencias : db.ocorrencias.filter((o) => o.usuarioId === usuarioId)
  return [...base].sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
}

function limitarFotos(lista: Ocorrencia[]): void {
  const comFoto = lista.filter((o) => o.fotoUrl).sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
  for (const o of comFoto.slice(MAX_FOTOS)) o.fotoUrl = null
}

export function criarOcorrenciasMock(opts: OpcoesOcorrenciasMock = {}): OcorrenciaRepository {
  const converterFoto = opts.converterFoto ?? lerComoDataUrl

  return {
    async criar(input: NovaOcorrenciaInput): Promise<Ocorrencia> {
      await atraso()
      const sessao = exigirSessao()
      const db = carregarDb()
      const fotoUrl = input.foto ? await converterFoto(input.foto) : null
      const agora = agoraIso()
      const nova: Ocorrencia = {
        id: gerarId(),
        usuarioId: sessao.usuario.id,
        categoria: input.categoria,
        descricao: input.descricao.trim(),
        localizacao: { ...input.localizacao },
        fotoUrl,
        status: 'ENVIADA',
        prioridade: null,
        criadoEm: agora,
        atualizadoEm: agora,
        historico: [{ status: 'ENVIADA', data: agora, mensagem: mensagemPorStatus('ENVIADA') }],
      }
      db.ocorrencias.push(nova)
      limitarFotos(db.ocorrencias)
      try {
        salvarDb(db)
      } catch {
        throw new ApiError(507, 'Sem espaço para guardar a foto. Tente sem foto ou resete os dados demo.', { caminho: CAMINHO })
      }
      return structuredClone(nova)
    },

    async listar(filtro?: FiltroOcorrencias): Promise<Ocorrencia[]> {
      await atraso()
      const sessao = exigirSessao()
      const db = carregarDb()
      return structuredClone(aplicarFiltro(visiveisPara(db, sessao.usuario.perfil, sessao.usuario.id), filtro))
    },

    async buscarPorId(id: string): Promise<Ocorrencia> {
      await atraso()
      const sessao = exigirSessao()
      const db = carregarDb()
      const o = visiveisPara(db, sessao.usuario.perfil, sessao.usuario.id).find((x) => x.id === id)
      if (!o) throw new ApiError(404, 'Ocorrência não encontrada', { caminho: `${CAMINHO}/${id}` })
      return structuredClone(o)
    },

    async atualizar(id: string, input: AtualizarOcorrenciaInput): Promise<Ocorrencia> {
      await atraso()
      const sessao = exigirSessao()
      if (sessao.usuario.perfil !== 'ADMINISTRADOR') {
        throw new ApiError(403, 'Apenas administradores podem alterar ocorrências', { caminho: `${CAMINHO}/${id}` })
      }
      const db = carregarDb()
      const o = db.ocorrencias.find((x) => x.id === id)
      if (!o) throw new ApiError(404, 'Ocorrência não encontrada', { caminho: `${CAMINHO}/${id}` })
      if (input.status && !podeTransitar(o.status, input.status)) {
        throw new ApiError(422, `Transição de ${o.status} para ${input.status} não é permitida`, { caminho: `${CAMINHO}/${id}` })
      }
      const agora = new Date(Math.max(Date.now(), new Date(o.atualizadoEm).getTime() + 1)).toISOString()
      if (input.prioridade) o.prioridade = input.prioridade
      if (input.status) {
        o.status = input.status
        o.historico.push({ status: input.status, data: agora, mensagem: mensagemPorStatus(input.status) })
      }
      o.atualizadoEm = agora
      salvarDb(db)
      return structuredClone(o)
    },

    async indicadores(): Promise<Indicadores> {
      await atraso()
      const sessao = exigirSessao()
      const db = carregarDb()
      return calcularIndicadores(visiveisPara(db, sessao.usuario.perfil, sessao.usuario.id))
    },
  }
}
