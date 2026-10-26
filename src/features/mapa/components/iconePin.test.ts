import { describe, expect, it } from 'vitest'
import { iconePin } from './iconePin'

describe('iconePin', () => {
  it('gera um divIcon com a cor do status e o raio do mockup', () => {
    const icone = iconePin('RESOLVIDA')
    const html = String(icone.options.html)
    expect(html).toContain('#1be7a6')
    expect(html).toContain('<svg')
    expect(icone.options.className).toContain('pin-ocorrencia')
    expect(icone.options.iconAnchor).toEqual([18, 44])
  })

  it('pin do usuário (sem status) usa a cor primária e marca como ativo', () => {
    const html = String(iconePin('ENVIADA', { ativo: true }).options.html)
    expect(html).toContain('pin-ativo')
  })
})
