import { describe, expect, it } from 'vitest'
import { iniciais } from './texto'

describe('iniciais', () => {
  it('usa primeira e última palavra', () => {
    expect(iniciais('Joana Silva')).toBe('JS')
    expect(iniciais('Administração Zelar App')).toBe('AA')
    expect(iniciais('Ana')).toBe('A')
    expect(iniciais('   ')).toBe('?')
  })
})
