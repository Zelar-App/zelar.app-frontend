import { describe, expect, it } from 'vitest'
import { CATEGORIAS, STATUS, PRIORIDADES, rotuloCategoria, rotuloStatus, SLA_DIAS } from './constantes'

describe('constantes de domínio', () => {
  it('lista as 7 categorias do DER na ordem', () => {
    expect(CATEGORIAS).toEqual(['BURACO', 'ILUMINACAO', 'LIXO', 'ALAGAMENTO', 'CALCADA', 'SINALIZACAO', 'AMBIENTAL'])
  })
  it('lista status e prioridades', () => {
    expect(STATUS).toEqual(['ENVIADA', 'EM_ANALISE', 'RESOLVIDA'])
    expect(PRIORIDADES).toEqual(['BAIXA', 'MEDIA', 'ALTA'])
  })
  it('tem rótulo em português para cada valor', () => {
    expect(rotuloCategoria('SINALIZACAO')).toBe('Sinalização danificada')
    expect(rotuloStatus('EM_ANALISE')).toBe('Em análise')
  })
  it('tem SLA em dias para toda categoria', () => {
    for (const c of CATEGORIAS) expect(SLA_DIAS[c]).toBeGreaterThan(0)
  })
})
