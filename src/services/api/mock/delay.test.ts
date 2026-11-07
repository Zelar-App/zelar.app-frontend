import { afterEach, describe, expect, it, vi } from 'vitest'
import { atraso } from './delay'

afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.restoreAllMocks() })

describe('latência simulada', () => {
  it('não agenda espera no modo test', async () => {
    const agendar = vi.spyOn(globalThis, 'setTimeout')
    await atraso()
    expect(agendar).not.toHaveBeenCalled()
  })

  it('respeita espera explícita na demonstração', async () => {
    vi.stubEnv('MODE', 'development')
    vi.useFakeTimers()
    const terminou = vi.fn()
    const resposta = atraso(50).then(terminou)
    await vi.advanceTimersByTimeAsync(49)
    expect(terminou).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await resposta
    expect(terminou).toHaveBeenCalledOnce()
  })

  it('usa atraso aleatório padrão quando não informado', async () => {
    vi.stubEnv('MODE', 'development')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    vi.useFakeTimers()
    const resposta = atraso()
    expect(vi.getTimerCount()).toBe(1)
    await vi.advanceTimersByTimeAsync(150)
    await resposta
    expect(vi.getTimerCount()).toBe(0)
  })
})
