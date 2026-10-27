import type {
  AtualizarOcorrenciaInput,
  Categoria,
  FiltroOcorrencias,
  HistoricoStatus,
  Indicadores,
  NovaOcorrenciaInput,
  Ocorrencia,
  Prioridade,
  StatusOcorrencia,
} from '../../../domain/types'
import { calcularIndicadores } from '../../../domain/ocorrencias/indicadores'
import { mensagemPorStatus } from '../../../domain/ocorrencias/mensagens'
import type { OcorrenciaRepository } from '../contracts'
import { ehApiError } from '../errors'
import type { ClienteHttp } from './client'

const CAMINHO = '/api/v1/ocorrencias'

/** Formato real do backend: localização plana (latitude/longitude) e datas com outros nomes. */
interface OcorrenciaBackend {
  id: string
  usuarioId: string
  categoria: Categoria
  descricao: string
  latitude: number
  longitude: number
  enderecoAproximado?: string | null
  status: StatusOcorrencia
  prioridade?: Prioridade | null
  dataCriacao: string
  dataAtualizacao: string
  fotoUrl?: string | null
  historico?: HistoricoStatus[]
}

interface PaginaOcorrencias {
  conteudo?: OcorrenciaBackend[]
  content?: OcorrenciaBackend[]
}

interface IndicadoresBackend {
  enviadas: number
  emAnalise: number
  resolvidas: number
}

function normalizar(o: OcorrenciaBackend): Ocorrencia {
  const historico: HistoricoStatus[] =
    Array.isArray(o.historico) && o.historico.length > 0
      ? o.historico
      : [
          { status: 'ENVIADA', data: o.dataCriacao, mensagem: mensagemPorStatus('ENVIADA') },
          ...(o.status !== 'ENVIADA'
            ? [{ status: o.status, data: o.dataAtualizacao ?? o.dataCriacao, mensagem: mensagemPorStatus(o.status) }]
            : []),
        ]
  return {
    id: o.id,
    usuarioId: o.usuarioId,
    categoria: o.categoria,
    descricao: o.descricao,
    localizacao: {
      latitude: o.latitude,
      longitude: o.longitude,
      enderecoAproximado: o.enderecoAproximado ?? null,
    },
    fotoUrl: o.fotoUrl ?? null,
    status: o.status,
    prioridade: o.prioridade ?? null,
    criadoEm: o.dataCriacao,
    atualizadoEm: o.dataAtualizacao ?? o.dataCriacao,
    historico,
  }
}

export function criarOcorrenciasHttp(http: ClienteHttp): OcorrenciaRepository {
  const repo: OcorrenciaRepository = {
    async criar(input: NovaOcorrenciaInput): Promise<Ocorrencia> {
      const dados = {
        categoria: input.categoria,
        descricao: input.descricao,
        latitude: input.localizacao.latitude,
        longitude: input.localizacao.longitude,
        enderecoAproximado: input.localizacao.enderecoAproximado ?? undefined,
      }
      if (input.foto) {
        // Backend aceita multipart: parte "dados" (JSON) + parte "foto" (arquivo).
        const form = new FormData()
        form.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
        form.append('foto', input.foto)
        return normalizar(await http.postForm<OcorrenciaBackend>(CAMINHO, form))
      }
      return normalizar(await http.post<OcorrenciaBackend>(CAMINHO, dados))
    },

    async listar(filtro: FiltroOcorrencias = {}): Promise<Ocorrencia[]> {
      const q = new URLSearchParams()
      if (filtro.status) q.set('status', filtro.status)
      if (filtro.prioridade) q.set('prioridade', filtro.prioridade)
      // O backend não filtra por categoria; enviamos mesmo assim para compatibilidade futura.
      if (filtro.categoria) q.set('categoria', filtro.categoria)
      q.set('tamanho', '100')
      const sufixo = q.size ? `?${q}` : ''
      const lista = await http.get<OcorrenciaBackend[] | PaginaOcorrencias>(`${CAMINHO}${sufixo}`)
      const itens = Array.isArray(lista) ? lista : (lista.conteudo ?? lista.content ?? [])
      return itens.map(normalizar).sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
    },

    async buscarPorId(id: string): Promise<Ocorrencia> {
      return normalizar(await http.get<OcorrenciaBackend>(`${CAMINHO}/${encodeURIComponent(id)}`))
    },

    async atualizar(id: string, input: AtualizarOcorrenciaInput): Promise<Ocorrencia> {
      // O backend expõe PATCH /{id}/status e PATCH /{id}/prioridade; aplica os que vierem.
      const caminho = `${CAMINHO}/${encodeURIComponent(id)}`
      let ultima: OcorrenciaBackend | null = null
      if (input.status) {
        ultima = await http.patch<OcorrenciaBackend>(`${caminho}/status`, { status: input.status })
      }
      if (input.prioridade) {
        ultima = await http.patch<OcorrenciaBackend>(`${caminho}/prioridade`, { prioridade: input.prioridade })
      }
      if (!ultima) {
        ultima = await http.get<OcorrenciaBackend>(caminho)
      }
      return normalizar(ultima)
    },

    async indicadores(): Promise<Indicadores> {
      try {
        const i = await http.get<IndicadoresBackend>(`${CAMINHO}/indicadores`)
        return {
          totalOcorrencias: i.enviadas + i.emAnalise + i.resolvidas,
          totalEnviadas: i.enviadas,
          totalEmAnalise: i.emAnalise,
          totalResolvidas: i.resolvidas,
        }
      } catch (e) {
        if (ehApiError(e) && e.status === 404) return calcularIndicadores(await repo.listar())
        throw e
      }
    },
  }
  return repo
}
