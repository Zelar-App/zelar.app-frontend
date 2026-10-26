import type { CadastroInput, LoginInput } from '../../domain/types'

/** Mesmas regras e mensagens do CriarUsuarioRequest do backend. */
export const REGRAS = {
  nomeMax: 100,
  emailMax: 150,
  senhaMin: 8,
  senhaMax: 72,
  telefoneMax: 20,
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type Erros<T> = Partial<Record<keyof T, string>>

export function validarLogin(v: LoginInput): Erros<LoginInput> {
  const erros: Erros<LoginInput> = {}
  if (!v.email.trim()) erros.email = 'O e-mail é obrigatório'
  else if (!EMAIL_RE.test(v.email.trim())) erros.email = 'O e-mail deve ser válido'
  if (!v.senha) erros.senha = 'A senha é obrigatória'
  return erros
}

export function validarCadastro(v: CadastroInput): Erros<CadastroInput> {
  const erros: Erros<CadastroInput> = {}
  if (!v.nome.trim()) erros.nome = 'O nome é obrigatório'
  else if (v.nome.trim().length > REGRAS.nomeMax) erros.nome = `O nome deve possuir no máximo ${REGRAS.nomeMax} caracteres`
  if (!v.email.trim()) erros.email = 'O e-mail é obrigatório'
  else if (!EMAIL_RE.test(v.email.trim())) erros.email = 'O e-mail deve ser válido'
  else if (v.email.trim().length > REGRAS.emailMax) erros.email = `O e-mail deve possuir no máximo ${REGRAS.emailMax} caracteres`
  if (!v.senha) erros.senha = 'A senha é obrigatória'
  else if (v.senha.length < REGRAS.senhaMin || v.senha.length > REGRAS.senhaMax)
    erros.senha = `A senha deve possuir entre ${REGRAS.senhaMin} e ${REGRAS.senhaMax} caracteres`
  if (v.telefone && v.telefone.trim().length > REGRAS.telefoneMax)
    erros.telefone = `O telefone deve possuir no máximo ${REGRAS.telefoneMax} caracteres`
  return erros
}

export const semErros = (e: object): boolean => Object.keys(e).length === 0
