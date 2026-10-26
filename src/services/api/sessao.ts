/**
 * Aviso global de sessão inválida (401). Os adapters emitem; o AuthProvider escuta e encerra a sessão,
 * para o usuário nunca ficar preso numa tela que só diz "Faça login para continuar".
 */
const alvo = new EventTarget()
const EVENTO = 'zelar:sessao-invalida'

export function emitirSessaoInvalida(): void {
  alvo.dispatchEvent(new Event(EVENTO))
}

export function aoSessaoInvalida(cb: () => void): () => void {
  alvo.addEventListener(EVENTO, cb)
  return () => alvo.removeEventListener(EVENTO, cb)
}
