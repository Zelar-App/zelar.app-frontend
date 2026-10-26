import { SLA_DIAS } from '../constantes'
import type { Ocorrencia } from '../types'

const MS_POR_DIA = 86_400_000

/**
 * Dias restantes até o prazo-alvo da ocorrência aberta mais próxima de vencer.
 * Retorna null quando não há ocorrências abertas.
 */
export function estimarDiasRestantes(lista: readonly Ocorrencia[], agora: Date = new Date()): number | null {
  let menor: number | null = null
  for (const o of lista) {
    if (o.status === 'RESOLVIDA') continue
    const decorridos = Math.floor((agora.getTime() - new Date(o.criadoEm).getTime()) / MS_POR_DIA)
    const restantes = Math.max(0, SLA_DIAS[o.categoria] - decorridos)
    if (menor === null || restantes < menor) menor = restantes
  }
  return menor
}
