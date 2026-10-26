import type { CadastroInput, LoginInput, Perfil, SessaoAuth, Usuario } from '../../../domain/types'
import { agoraIso } from '../../../shared/lib/datas'
import { gerarId } from '../../../shared/lib/id'
import type { AuthRepository } from '../contracts'
import { ApiError } from '../errors'
import { carregarDb, CHAVE_SESSAO, salvarDb } from './db'
import { atraso } from './delay'
import type { UsuarioSeed } from './seed'

interface TokenMock {
  sub: string
  perfil: Perfil
  exp: number
}

const UM_DIA_S = 86_400

function semSenha(u: UsuarioSeed): Usuario {
  const { senha: _senha, ...resto } = u
  return resto
}

export function gerarTokenMock(usuario: Usuario): string {
  const payload: TokenMock = { sub: usuario.id, perfil: usuario.perfil, exp: Math.floor(Date.now() / 1000) + 7 * UM_DIA_S }
  return 'mock.' + btoa(JSON.stringify(payload))
}

export function lerTokenMock(token: string | null | undefined): TokenMock | null {
  if (!token || !token.startsWith('mock.')) return null
  try {
    const payload = JSON.parse(atob(token.slice(5))) as TokenMock
    if (payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function lerSessaoSalva(): SessaoAuth | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE_SESSAO)
    if (!bruto) return null
    const sessao = JSON.parse(bruto) as SessaoAuth
    return lerTokenMock(sessao.token) ? sessao : null
  } catch {
    return null
  }
}

export function criarAuthMock(): AuthRepository {
  return {
    async cadastrar(input: CadastroInput): Promise<Usuario> {
      await atraso()
      const db = carregarDb()
      const email = input.email.trim().toLowerCase()
      if (db.usuarios.some((u) => u.email === email)) {
        throw new ApiError(409, 'E-mail já cadastrado', { caminho: '/api/v1/usuarios' })
      }
      const novo: UsuarioSeed = {
        id: gerarId(),
        nome: input.nome.trim(),
        email,
        senha: input.senha,
        perfil: 'CIDADAO',
        telefone: input.telefone?.trim() || null,
        criadoEm: agoraIso(),
      }
      db.usuarios.push(novo)
      salvarDb(db)
      return semSenha(novo)
    },

    async login(input: LoginInput): Promise<SessaoAuth> {
      await atraso()
      const db = carregarDb()
      const email = input.email.trim().toLowerCase()
      const u = db.usuarios.find((x) => x.email === email && x.senha === input.senha)
      if (!u) throw new ApiError(401, 'E-mail ou senha inválidos', { caminho: '/api/v1/auth/login' })
      const usuario = semSenha(u)
      const sessao: SessaoAuth = { token: gerarTokenMock(usuario), usuario }
      window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
      return sessao
    },

    async restaurarSessao(): Promise<SessaoAuth | null> {
      return lerSessaoSalva()
    },

    async logout(): Promise<void> {
      window.localStorage.removeItem(CHAVE_SESSAO)
    },
  }
}
