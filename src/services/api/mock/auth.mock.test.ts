import { beforeEach, describe, expect, it } from 'vitest'
import { criarAuthMock, lerTokenMock } from './auth.mock'
import { criarOcorrenciasMock } from './ocorrencias.mock'
import { aoSessaoInvalida } from '../sessao'
import { ApiError } from '../errors'
import { USUARIOS_SEED } from './seed'

const joana = USUARIOS_SEED[0]

describe('auth mock', () => {
  beforeEach(() => window.localStorage.clear())

  it('faz login do usuário do seed e devolve sessão com token e usuário', async () => {
    const auth = criarAuthMock()
    const sessao = await auth.login({ email: joana.email, senha: joana.senha })
    expect(sessao.token).toMatch(/^mock\./)
    expect(sessao.usuario).toMatchObject({ email: joana.email, perfil: 'CIDADAO' })
    expect(sessao.usuario).not.toHaveProperty('senha')
  })

  it('rejeita senha errada com 401', async () => {
    const auth = criarAuthMock()
    await expect(auth.login({ email: joana.email, senha: 'errada' })).rejects.toMatchObject({ status: 401 })
  })

  it('cadastra novo cidadão (e-mail normalizado) e permite login em seguida', async () => {
    const auth = criarAuthMock()
    const u = await auth.cadastrar({ nome: 'Carlos', email: '  Carlos@Teste.com ', senha: 'senha1234' })
    expect(u).toMatchObject({ nome: 'Carlos', email: 'carlos@teste.com', perfil: 'CIDADAO' })
    expect(u.id).toBeTruthy()
    const sessao = await auth.login({ email: 'carlos@teste.com', senha: 'senha1234' })
    expect(sessao.usuario.id).toBe(u.id)
  })

  it('rejeita e-mail duplicado com 409 e a mensagem do backend', async () => {
    const auth = criarAuthMock()
    const erro = await auth.cadastrar({ nome: 'X', email: joana.email, senha: 'senha1234' }).catch((e) => e)
    expect(erro).toBeInstanceOf(ApiError)
    expect(erro).toMatchObject({ status: 409, mensagem: 'E-mail já cadastrado' })
  })

  it('restaura a sessão de outra instância e esquece após logout', async () => {
    await criarAuthMock().login({ email: joana.email, senha: joana.senha })
    const auth2 = criarAuthMock()
    const restaurada = await auth2.restaurarSessao()
    expect(restaurada?.usuario.email).toBe(joana.email)
    await auth2.logout()
    expect(await criarAuthMock().restaurarSessao()).toBeNull()
  })

  it('token mock expirado é rejeitado', () => {
    const expirado = 'mock.' + btoa(JSON.stringify({ sub: 'x', perfil: 'CIDADAO', exp: Math.floor(Date.now() / 1000) - 10 }))
    expect(lerTokenMock(expirado)).toBeNull()
    const valido = 'mock.' + btoa(JSON.stringify({ sub: 'x', perfil: 'CIDADAO', exp: Math.floor(Date.now() / 1000) + 10 }))
    expect(lerTokenMock(valido)?.sub).toBe('x')
  })

  it('chamada com sessão expirada responde 401 e avisa que a sessão é inválida', async () => {
    const expirado = 'mock.' + btoa(JSON.stringify({ sub: joana.id, perfil: 'CIDADAO', exp: Math.floor(Date.now() / 1000) - 10 }))
    window.localStorage.setItem('zelar.sessao', JSON.stringify({ token: expirado, usuario: { ...joana, senha: undefined } }))
    const avisos: number[] = []
    const parar = aoSessaoInvalida(() => avisos.push(1))
    await expect(criarOcorrenciasMock().listar()).rejects.toMatchObject({ status: 401 })
    expect(avisos).toHaveLength(1)
    parar()
  })
})
