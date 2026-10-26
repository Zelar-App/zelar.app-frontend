import { describe, expect, it } from 'vitest'
import { mensagemPorStatus } from './mensagens'

describe('mensagemPorStatus', () => {
  it('usa os textos da caixa de entrada do mockup', () => {
    expect(mensagemPorStatus('ENVIADA')).toBe('Sua solicitação foi enviada com sucesso')
    expect(mensagemPorStatus('EM_ANALISE')).toBe('O órgão responsável foi acionado')
    expect(mensagemPorStatus('RESOLVIDA')).toBe('Seu chamado foi concluído e o problema foi resolvido!')
  })
})
