/** Mesmo formato do `ApiError` do backend Spring (shared/exception/ApiError.java). */
export class ApiError extends Error {
  readonly status: number
  readonly erro: string
  readonly mensagem: string
  readonly caminho?: string
  readonly timestamp: string

  constructor(status: number, mensagem: string, opts: { erro?: string; caminho?: string; timestamp?: string } = {}) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.mensagem = mensagem
    this.erro = opts.erro ?? ERROS_PADRAO[status] ?? 'Error'
    this.caminho = opts.caminho
    this.timestamp = opts.timestamp ?? new Date().toISOString()
  }
}

const ERROS_PADRAO: Record<number, string> = {
  0: 'Network Error',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
}

export function ehApiError(e: unknown): e is ApiError {
  return e instanceof ApiError
}

/** Mensagem segura para exibir ao usuário a partir de qualquer erro. */
export function mensagemDeErro(e: unknown, padrao = 'Algo deu errado. Tente novamente.'): string {
  if (ehApiError(e)) return e.mensagem
  if (e instanceof Error && e.message) return e.message
  return padrao
}
