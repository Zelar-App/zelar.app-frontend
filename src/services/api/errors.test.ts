import { describe, expect, it } from 'vitest'
import { ApiError, ehApiError, mensagemDeErro } from './errors'

describe('erros de API', () => {
  it('preserva metadados do backend e fornece padrões quando ausentes', () => {
    const erro = new ApiError(404, 'Ausente', { erro: 'Custom', caminho: '/x', timestamp: '2026-11-06T12:00:00Z' })
    expect(erro).toMatchObject({ name: 'ApiError', status: 404, erro: 'Custom', caminho: '/x', timestamp: '2026-11-06T12:00:00Z', message: 'Ausente' })
    expect(new ApiError(401, 'Sessão').erro).toBe('Unauthorized')
    expect(new ApiError(599, 'Falha').erro).toBe('Error')
    expect(Number.isNaN(Date.parse(new ApiError(0, 'Rede').timestamp))).toBe(false)
  })

  it('retorna apenas mensagem utilizável, com fallback para valores desconhecidos', () => {
    expect(ehApiError(new Error('Comum'))).toBe(false)
    expect(ehApiError(new ApiError(400, 'Entrada'))).toBe(true)
    expect(mensagemDeErro(new ApiError(400, 'Entrada'))).toBe('Entrada')
    expect(mensagemDeErro(new Error('Comum'))).toBe('Comum')
    expect(mensagemDeErro(new Error(''), 'Padrão')).toBe('Padrão')
    expect(mensagemDeErro(null)).toMatch(/Algo deu errado/)
    expect(mensagemDeErro({ message: 'objeto não confiável' }, 'Seguro')).toBe('Seguro')
  })
})
