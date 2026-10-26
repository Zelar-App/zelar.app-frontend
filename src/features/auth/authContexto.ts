import { createContext } from 'react'
import type { CadastroInput, LoginInput, Usuario } from '../../domain/types'

export interface AuthValor {
  usuario: Usuario | null
  carregando: boolean
  ehAdmin: boolean
  login(input: LoginInput): Promise<void>
  cadastrar(input: CadastroInput): Promise<void>
  logout(): Promise<void>
}

export const AuthContext = createContext<AuthValor | null>(null)
