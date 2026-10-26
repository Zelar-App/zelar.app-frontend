import type { Indicadores, Ocorrencia } from '../types'

export function calcularIndicadores(lista: readonly Ocorrencia[]): Indicadores {
  const ind: Indicadores = {
    totalOcorrencias: lista.length,
    totalEnviadas: 0,
    totalEmAnalise: 0,
    totalResolvidas: 0,
  }
  for (const o of lista) {
    if (o.status === 'ENVIADA') ind.totalEnviadas++
    else if (o.status === 'EM_ANALISE') ind.totalEmAnalise++
    else ind.totalResolvidas++
  }
  return ind
}
