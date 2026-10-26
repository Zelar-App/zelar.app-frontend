import { ApiError } from '../errors'
import { emitirSessaoInvalida } from '../sessao'

export interface OpcoesCliente {
  baseUrl: string
  obterToken: () => string | null
}

export interface ClienteHttp {
  get<T>(caminho: string, init?: RequestInit): Promise<T>
  post<T>(caminho: string, corpo?: unknown, init?: RequestInit): Promise<T>
  put<T>(caminho: string, corpo?: unknown, init?: RequestInit): Promise<T>
  /** multipart/form-data (o navegador define o boundary). */
  postForm<T>(caminho: string, form: FormData, init?: RequestInit): Promise<T>
}

interface CorpoErroBackend {
  status?: number
  erro?: string
  mensagem?: string
  caminho?: string
  timestamp?: string
}

async function lerCorpo<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  const texto = await res.text()
  if (!texto) return undefined as T
  try {
    return JSON.parse(texto) as T
  } catch {
    return texto as unknown as T
  }
}

export function criarClienteHttp({ baseUrl, obterToken }: OpcoesCliente): ClienteHttp {
  const base = baseUrl.replace(/\/+$/, '')

  async function requisitar<T>(caminho: string, init: RequestInit, corpo?: unknown, form?: FormData): Promise<T> {
    const headers = new Headers(init.headers)
    headers.set('accept', 'application/json')
    const token = obterToken()
    if (token) headers.set('authorization', `Bearer ${token}`)
    let body: BodyInit | undefined
    if (form) body = form
    else if (corpo !== undefined) {
      headers.set('content-type', 'application/json')
      body = JSON.stringify(corpo)
    }

    let res: Response
    try {
      res = await fetch(`${base}${caminho}`, { ...init, headers, body })
    } catch {
      throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.', { caminho })
    }

    if (!res.ok) {
      if (res.status === 401 && !caminho.includes('/auth/login')) emitirSessaoInvalida()
      const erro = await lerCorpo<CorpoErroBackend | string>(res)
      const detalhe = typeof erro === 'object' && erro ? erro : {}
      const mensagem =
        (typeof erro === 'object' && erro?.mensagem) ||
        (res.status === 401 ? 'Sessão inválida. Faça login novamente.' : null) ||
        (res.status === 403 ? 'Você não tem permissão para esta ação.' : null) ||
        `Erro ${res.status} ao chamar ${caminho}`
      throw new ApiError(res.status, mensagem, { erro: detalhe.erro, caminho: detalhe.caminho ?? caminho, timestamp: detalhe.timestamp })
    }
    return lerCorpo<T>(res)
  }

  return {
    get: (caminho, init = {}) => requisitar(caminho, { ...init, method: 'GET' }),
    post: (caminho, corpo, init = {}) => requisitar(caminho, { ...init, method: 'POST' }, corpo),
    put: (caminho, corpo, init = {}) => requisitar(caminho, { ...init, method: 'PUT' }, corpo),
    postForm: (caminho, form, init = {}) => requisitar(caminho, { ...init, method: 'POST' }, undefined, form),
  }
}
