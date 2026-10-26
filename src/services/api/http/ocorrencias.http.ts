import type {
  AtualizarOcorrenciaInput,
  FiltroOcorrencias,
  HistoricoStatus,
  Indicadores,
  NovaOcorrenciaInput,
  Ocorrencia,
} from '../../../domain/types'
import { calcularIndicadores } from '../../../domain/ocorrencias/indicadores'
import { mensagemPorStatus } from '../../../domain/ocorrencias/mensagens'
import type { OcorrenciaRepository } from '../contracts'
import { ApiError, ehApiError, mensagemDeErro } from '../errors'
import type { ClienteHttp } from './client'

const CAMINHO = '/api/v1/ocorrencias'

interface OcorrenciaResponse extends Omit<Ocorrencia, 'localizacao' | 'criadoEm' | 'atualizadoEm' | 'historico'> {
  latitude: number
  longitude: number
  enderecoAproximado?: string | null
  dataCriacao: string
  dataAtualizacao?: string | null
  historico?: HistoricoStatus[]
}

interface PaginaResponse {
  conteudo: OcorrenciaResponse[]
  pagina: number
  tamanho: number
  totalElementos: number
  totalPaginas: number
}

/** Converte o DTO externo sem mudar o modelo interno das telas. */
function normalizar(dto: OcorrenciaResponse): Ocorrencia {
  const atualizadoEm = dto.dataAtualizacao ?? dto.dataCriacao
  const historico: HistoricoStatus[] = dto.historico?.length ? dto.historico : [
    { status: 'ENVIADA', data: dto.dataCriacao, mensagem: mensagemPorStatus('ENVIADA') },
    ...(dto.status === 'ENVIADA' ? [] : [{ status: dto.status, data: atualizadoEm, mensagem: mensagemPorStatus(dto.status) }]),
  ]
  return {
    id: dto.id, usuarioId: dto.usuarioId, categoria: dto.categoria, descricao: dto.descricao,
    localizacao: { latitude: dto.latitude, longitude: dto.longitude, enderecoAproximado: dto.enderecoAproximado },
    fotoUrl: dto.fotoUrl, status: dto.status, prioridade: dto.prioridade,
    criadoEm: dto.dataCriacao, atualizadoEm, historico,
  }
}

export function criarOcorrenciasHttp(http: ClienteHttp): OcorrenciaRepository {
  return {
    async criar(input: NovaOcorrenciaInput): Promise<Ocorrencia> {
      // A develop aceita JSON; multipart depende do contrato ainda pendente da BE-13.
      if (input.foto) throw new ApiError(501, 'O servidor ainda não aceita fotos. Remova a foto para enviar o chamado.')
      const dados = {
        categoria: input.categoria,
        descricao: input.descricao,
        latitude: input.localizacao.latitude,
        longitude: input.localizacao.longitude,
        enderecoAproximado: input.localizacao.enderecoAproximado ?? undefined,
      }
      return normalizar(await http.post<OcorrenciaResponse>(CAMINHO, dados))
    },

    async listar(filtro: FiltroOcorrencias = {}): Promise<Ocorrencia[]> {
      const q = new URLSearchParams({ pagina: '0', tamanho: '100' })
      if (filtro.status) q.set('status', filtro.status)
      if (filtro.prioridade) q.set('prioridade', filtro.prioridade)
      const itens: Ocorrencia[] = []
      let pagina = 0
      let totalPaginas: number
      do {
        q.set('pagina', String(pagina))
        const resposta = await http.get<PaginaResponse>(`${CAMINHO}?${q}`)
        if (!Array.isArray(resposta.conteudo) || resposta.pagina !== pagina || !Number.isInteger(resposta.totalPaginas) || resposta.totalPaginas < 0) {
          throw new ApiError(502, 'O servidor retornou uma página de ocorrências inválida.')
        }
        itens.push(...resposta.conteudo.map(normalizar))
        totalPaginas = resposta.totalPaginas
        pagina++
      } while (pagina < totalPaginas)
      // O backend filtra status/prioridade; categoria e autoria são filtradas no cliente.
      return itens.filter((item) => (!filtro.categoria || item.categoria === filtro.categoria) && (!filtro.usuarioId || item.usuarioId === filtro.usuarioId))
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    },

    async buscarPorId(id: string): Promise<Ocorrencia> {
      return normalizar(await http.get<OcorrenciaResponse>(`${CAMINHO}/${encodeURIComponent(id)}`))
    },

    async atualizar(id: string, input: AtualizarOcorrenciaInput): Promise<Ocorrencia> {
      const caminho = `${CAMINHO}/${encodeURIComponent(id)}`
      let atualizada: OcorrenciaResponse | undefined
      if (input.prioridade) atualizada = await http.patch<OcorrenciaResponse>(`${caminho}/prioridade`, { prioridade: input.prioridade })
      if (input.status) {
        try {
          atualizada = await http.patch<OcorrenciaResponse>(`${caminho}/status`, { status: input.status })
        } catch (erro) {
          if (atualizada) throw new ApiError(ehApiError(erro) ? erro.status : 0, `A prioridade foi salva, mas o status não foi atualizado. ${mensagemDeErro(erro)}`)
          throw erro
        }
      }
      return normalizar(atualizada ?? await http.get<OcorrenciaResponse>(caminho))
    },

    async indicadores(): Promise<Indicadores> {
      try {
        // Formato da BE-15 (#83), cuja integração no backend é uma dependência externa.
        const dto = await http.get<{ enviadas: number; emAnalise: number; resolvidas: number }>(`${CAMINHO}/indicadores`)
        return { totalEnviadas: dto.enviadas, totalEmAnalise: dto.emAnalise, totalResolvidas: dto.resolvidas, totalOcorrencias: dto.enviadas + dto.emAnalise + dto.resolvidas }
      } catch (e) {
        if (ehApiError(e) && e.status === 404) return calcularIndicadores(await this.listar())
        throw e
      }
    },
  }
}
