import { describe, expect, it } from 'vitest'
import { podeTransitar, proximoStatus } from './transicoes'

describe('proximoStatus', () => {
  it('ENVIADA avança para EM_ANALISE', () => {
    expect(proximoStatus('ENVIADA')).toBe('EM_ANALISE')
  })
  it('EM_ANALISE avança para RESOLVIDA', () => {
    expect(proximoStatus('EM_ANALISE')).toBe('RESOLVIDA')
  })
  it('RESOLVIDA é final', () => {
    expect(proximoStatus('RESOLVIDA')).toBeNull()
  })
})

describe('podeTransitar', () => {
  it('aceita só o próximo passo', () => {
    expect(podeTransitar('ENVIADA', 'EM_ANALISE')).toBe(true)
    expect(podeTransitar('EM_ANALISE', 'RESOLVIDA')).toBe(true)
  })
  it('rejeita pular etapa, voltar ou repetir', () => {
    expect(podeTransitar('ENVIADA', 'RESOLVIDA')).toBe(false)
    expect(podeTransitar('EM_ANALISE', 'ENVIADA')).toBe(false)
    expect(podeTransitar('RESOLVIDA', 'EM_ANALISE')).toBe(false)
    expect(podeTransitar('ENVIADA', 'ENVIADA')).toBe(false)
  })
})
