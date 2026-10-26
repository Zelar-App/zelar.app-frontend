import type { Categoria, Prioridade, StatusOcorrencia } from './types'

export const CATEGORIAS: readonly Categoria[] = [
  'BURACO',
  'ILUMINACAO',
  'LIXO',
  'ALAGAMENTO',
  'CALCADA',
  'SINALIZACAO',
  'AMBIENTAL',
]

export const STATUS: readonly StatusOcorrencia[] = ['ENVIADA', 'EM_ANALISE', 'RESOLVIDA']

export const PRIORIDADES: readonly Prioridade[] = ['BAIXA', 'MEDIA', 'ALTA']

const ROTULO_CATEGORIA: Record<Categoria, string> = {
  BURACO: 'Buraco na via',
  ILUMINACAO: 'Iluminação pública',
  LIXO: 'Acúmulo de lixo',
  ALAGAMENTO: 'Alagamento',
  CALCADA: 'Problema na calçada',
  SINALIZACAO: 'Sinalização danificada',
  AMBIENTAL: 'Ocorrência ambiental',
}

const ROTULO_STATUS: Record<StatusOcorrencia, string> = {
  ENVIADA: 'Enviada',
  EM_ANALISE: 'Em análise',
  RESOLVIDA: 'Resolvida',
}

const ROTULO_PRIORIDADE: Record<Prioridade, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
}

/** Prazo-alvo (dias) usado só para a estimativa de espera exibida ao cidadão. */
export const SLA_DIAS: Record<Categoria, number> = {
  BURACO: 10,
  ILUMINACAO: 7,
  LIXO: 3,
  ALAGAMENTO: 5,
  CALCADA: 15,
  SINALIZACAO: 7,
  AMBIENTAL: 12,
}

export const rotuloCategoria = (c: Categoria): string => ROTULO_CATEGORIA[c]
export const rotuloStatus = (s: StatusOcorrencia): string => ROTULO_STATUS[s]
export const rotuloPrioridade = (p: Prioridade): string => ROTULO_PRIORIDADE[p]
