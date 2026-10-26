import type { Ocorrencia, StatusOcorrencia } from '../../domain/types'

export interface MensagemCaixa {
  ocorrenciaId: string
  status: StatusOcorrencia
  data: string
  mensagem: string
}

/** Caixa de entrada do mockup: eventos de status de todas as ocorrências, mais recentes primeiro. */
export function montarCaixaDeEntrada(lista: readonly Ocorrencia[], limite = Infinity): MensagemCaixa[] {
  const todos: MensagemCaixa[] = []
  for (const o of lista) for (const h of o.historico) todos.push({ ocorrenciaId: o.id, status: h.status, data: h.data, mensagem: h.mensagem })
  todos.sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))
  return Number.isFinite(limite) ? todos.slice(0, limite) : todos
}
