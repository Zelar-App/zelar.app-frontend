import type { StatusOcorrencia } from '../types'

const MENSAGENS: Record<StatusOcorrencia, string> = {
  ENVIADA: 'Sua solicitação foi enviada com sucesso',
  EM_ANALISE: 'O órgão responsável foi acionado',
  RESOLVIDA: 'Seu chamado foi concluído e o problema foi resolvido!',
}

export function mensagemPorStatus(status: StatusOcorrencia): string {
  return MENSAGENS[status]
}
