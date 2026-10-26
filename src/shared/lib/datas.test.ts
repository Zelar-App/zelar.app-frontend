import { describe, expect, it } from 'vitest'
import { diasAtras, formatarData, formatarHora } from './datas'

describe('datas', () => {
  it('formata em pt-BR', () => {
    const iso = new Date(2026, 9, 10, 14, 37).toISOString()
    expect(formatarData(iso)).toBe('10/10/2026')
    expect(formatarHora(iso)).toBe('14:37')
  })
  it('conta dias decorridos', () => {
    const agora = new Date('2026-10-10T12:00:00Z')
    expect(diasAtras('2026-10-08T12:00:00Z', agora)).toBe(2)
  })
})
