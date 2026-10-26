import type { CadastroInput, LoginInput, SessaoAuth, Usuario } from '../../../domain/types'
import type { AuthRepository } from '../contracts'
import type { ClienteHttp } from './client'

export const CHAVE_SESSAO_HTTP = 'zelar.sessao'

function lerSessao(): SessaoAuth | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE_SESSAO_HTTP)
    return bruto ? (JSON.parse(bruto) as SessaoAuth) : null
  } catch {
    return null
  }
}

/** JWT usa base64url (sem padding, com `-` e `_`); `atob` só entende base64 padrão. */
function decodificarBase64Url(parte: string): string {
  const base64 = parte.replace(/-/g, '+').replace(/_/g, '/')
  const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4))
  return atob(base64 + padding)
}

export function tokenExpirado(token: string): boolean {
  try {
    const payload = JSON.parse(decodificarBase64Url(token.split('.')[1] ?? '')) as { exp?: number }
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()
  } catch {
    return false // token opaco: deixa o backend decidir
  }
}

export function lerTokenHttp(): string | null {
  return lerSessao()?.token ?? null
}

export function criarAuthHttp(http: ClienteHttp): AuthRepository {
  return {
    cadastrar(input: CadastroInput): Promise<Usuario> {
      return http.post<Usuario>('/api/v1/usuarios', {
        nome: input.nome,
        email: input.email,
        senha: input.senha,
        telefone: input.telefone || undefined,
      })
    },

    async login(input: LoginInput): Promise<SessaoAuth> {
      const sessao = await http.post<SessaoAuth>('/api/v1/auth/login', input)
      window.localStorage.setItem(CHAVE_SESSAO_HTTP, JSON.stringify(sessao))
      return sessao
    },

    async restaurarSessao(): Promise<SessaoAuth | null> {
      const sessao = lerSessao()
      if (!sessao || tokenExpirado(sessao.token)) {
        window.localStorage.removeItem(CHAVE_SESSAO_HTTP)
        return null
      }
      return sessao
    },

    async logout(): Promise<void> {
      window.localStorage.removeItem(CHAVE_SESSAO_HTTP)
    },
  }
}
