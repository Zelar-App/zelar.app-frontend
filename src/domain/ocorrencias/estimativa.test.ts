import { describe, expect, it } from 'vitest'
import { estimarDiasRestantes } from './estimativa'
import type { Ocorrencia } from '../types'

const agora = new Date('2026-10-10T12:00:00Z')
const dias = (n: number) => new Date(agora.getTime() - n * 86_400_000).toISOString()

const oc = (categoria: Ocorrencia['categoria'], status: Ocorrencia['status'], idadeDias: number): Ocorrencia => ({
  id: 'x',
  usuarioId: 'u',
  categoria,
  descricao: '',
  localizacao: { latitude: 0, longitude: 0 },
  status,
  criadoEm: dias(idadeDias),
  atualizadoEm: dias(idadeDias),
  historico: [],
})

describe('estimarDiasRestantes', () => {
  it('retorna null sem ocorrências abertas', () => {
    expect(estimarDiasRestantes([], agora)).toBeNull()
    expect(estimarDiasRestantes([oc('LIXO', 'RESOLVIDA', 1)], agora)).toBeNull()
  })
  it('usa o SLA da categoria menos os dias decorridos', () => {
    // BURACO tem SLA de 10 dias; aberta há 2 → 8 restantes (como no mockup)
    expect(estimarDiasRestantes([oc('BURACO', 'ENVIADA', 2)], agora)).toBe(8)
  })
  it('com várias abertas devolve a mais próxima do prazo e nunca negativo', () => {
    const lista = [oc('BURACO', 'ENVIADA', 2), oc('LIXO', 'EM_ANALISE', 1), oc('CALCADA', 'ENVIADA', 40)]
    // LIXO: SLA 3 - 1 = 2; CALCADA: 15 - 40 → 0
    expect(estimarDiasRestantes(lista, agora)).toBe(0)
    expect(estimarDiasRestantes(lista.slice(0, 2), agora)).toBe(2)
  })
})
