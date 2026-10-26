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
import { ehApiError } from '../errors'
import type { ClienteHttp } from './client'

const CAMINHO = '/api/v1/ocorrencias'

/** O backend pode não enviar `historico`; sintetizamos um mínimo para a UI. */
function normalizar(o: Ocorrencia): Ocorrencia {
  if (Array.isArray(o.historico) && o.historico.length > 0) return o
  const historico: HistoricoStatus[] = [{ status: 'ENVIADA', data: o.criadoEm, mensagem: mensagemPorStatus('ENVIADA') }]
  if (o.status !== 'ENVIADA') historico.push({ status: o.status, data: o.atualizadoEm ?? o.criadoEm, mensagem: mensagemPorStatus(o.status) })
  return { ...o, atualizadoEm: o.atualizadoEm ?? o.criadoEm, historico }
}

export function criarOcorrenciasHttp(http: ClienteHttp): OcorrenciaRepository {
  return {
    async criar(input: NovaOcorrenciaInput): Promise<Ocorrencia> {
      const dados = {
        categoria: input.categoria,
        descricao: input.descricao,
        latitude: input.localizacao.latitude,
        longitude: input.localizacao.longitude,
        enderecoAproximado: input.localizacao.enderecoAproximado ?? undefined,
      }
      if (input.foto) {
        const form = new FormData()
        form.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
        form.append('foto', input.foto, input.foto.name)
        return normalizar(await http.postForm<Ocorrencia>(CAMINHO, form))
      }
      return normalizar(await http.post<Ocorrencia>(CAMINHO, dados))
    },

    async listar(filtro: FiltroOcorrencias = {}): Promise<Ocorrencia[]> {
      const q = new URLSearchParams()
      if (filtro.status) q.set('status', filtro.status)
      if (filtro.prioridade) q.set('prioridade', filtro.prioridade)
      if (filtro.categoria) q.set('categoria', filtro.categoria)
      const sufixo = q.size ? `?${q}` : ''
      const lista = await http.get<Ocorrencia[] | { content: Ocorrencia[] }>(`${CAMINHO}${sufixo}`)
      const itens = Array.isArray(lista) ? lista : lista.content
      return itens.map(normalizar).sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
    },

    async buscarPorId(id: string): Promise<Ocorrencia> {
      return normalizar(await http.get<Ocorrencia>(`${CAMINHO}/${encodeURIComponent(id)}`))
    },

    async atualizar(id: string, input: AtualizarOcorrenciaInput): Promise<Ocorrencia> {
      return normalizar(await http.put<Ocorrencia>(`${CAMINHO}/${encodeURIComponent(id)}`, input))
    },

    async indicadores(): Promise<Indicadores> {
      try {
        return await http.get<Indicadores>(`${CAMINHO}/indicadores`)
      } catch (e) {
        if (ehApiError(e) && e.status === 404) return calcularIndicadores(await this.listar())
        throw e
      }
    },
  }
}
