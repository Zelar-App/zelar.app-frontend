import { describe, expect, it } from 'vitest'
import { lerEnv } from './env'

describe('lerEnv', () => {
  it('usa mock, localhost:8080 e Belo Horizonte como padrões', () => {
    expect(lerEnv({})).toEqual({
      apiMode: 'mock',
      apiBaseUrl: 'http://localhost:8080',
      mapCenter: [-19.9167, -43.9345],
    })
  })

  it('lê os valores das variáveis VITE_*', () => {
    const env = lerEnv({
      VITE_API_MODE: 'http',
      VITE_API_BASE_URL: 'https://api.zelar.app/',
      VITE_MAP_CENTER: '-23.55, -46.63',
    })
    expect(env.apiMode).toBe('http')
    expect(env.apiBaseUrl).toBe('https://api.zelar.app')
    expect(env.mapCenter).toEqual([-23.55, -46.63])
  })

  it('cai no padrão quando o modo ou o centro são inválidos', () => {
    const env = lerEnv({ VITE_API_MODE: 'graphql', VITE_MAP_CENTER: 'abc' })
    expect(env.apiMode).toBe('mock')
    expect(env.mapCenter).toEqual([-19.9167, -43.9345])
  })
})
