import { describe, expect, it } from 'vitest'
import { calcularIndicadores } from './indicadores'
import type { Ocorrencia } from '../types'

const base = (status: Ocorrencia['status']): Ocorrencia => ({
  id: 'x',
  usuarioId: 'u',
  categoria: 'BURACO',
  descricao: '',
  localizacao: { latitude: 0, longitude: 0 },
  status,
  criadoEm: '2026-10-01T00:00:00Z',
  atualizadoEm: '2026-10-01T00:00:00Z',
  historico: [],
})

describe('calcularIndicadores', () => {
  it('zera tudo com lista vazia', () => {
    expect(calcularIndicadores([])).toEqual({
      totalOcorrencias: 0,
      totalEnviadas: 0,
      totalEmAnalise: 0,
      totalResolvidas: 0,
    })
  })
  it('conta por status', () => {
    const lista = [base('ENVIADA'), base('ENVIADA'), base('EM_ANALISE'), base('RESOLVIDA')]
    expect(calcularIndicadores(lista)).toEqual({
      totalOcorrencias: 4,
      totalEnviadas: 2,
      totalEmAnalise: 1,
      totalResolvidas: 1,
    })
  })
})
