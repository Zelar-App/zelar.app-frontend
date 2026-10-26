import { describe, expect, it } from 'vitest'
import { criarApi } from './index'

describe('criarApi', () => {
  it('escolhe mock ou http pelo modo', () => {
    expect(criarApi({ apiMode: 'mock', apiBaseUrl: 'http://x', mapCenter: [0, 0] }).modo).toBe('mock')
    expect(criarApi({ apiMode: 'http', apiBaseUrl: 'http://x', mapCenter: [0, 0] }).modo).toBe('http')
  })
})
