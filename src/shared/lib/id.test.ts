import { afterEach, describe, expect, it, vi } from 'vitest'
import { gerarId } from './id'

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('identificadores', () => {
  it('prefere a geração criptográfica quando disponível', () => {
    const randomUUID = vi.fn(() => 'id-criptografico')
    vi.stubGlobal('crypto', { randomUUID })
    expect(gerarId()).toBe('id-criptografico')
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it.each([undefined, {}])('mantém formato UUID no fallback sem randomUUID', (crypto) => {
    vi.stubGlobal('crypto', crypto)
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(gerarId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(random).toHaveBeenCalled()
  })
})
