import type { Ocorrencia } from '../../../domain/types'
import { gerarOcorrenciasSeed, USUARIOS_SEED, type UsuarioSeed } from './seed'

export const CHAVE_DB = 'zelar.db'
export const CHAVE_SESSAO = 'zelar.sessao'
const VERSAO_ATUAL = 1 as const

export interface MockDb {
  versao: typeof VERSAO_ATUAL
  usuarios: UsuarioSeed[]
  ocorrencias: Ocorrencia[]
}

function semear(): MockDb {
  return { versao: VERSAO_ATUAL, usuarios: USUARIOS_SEED.map((u) => ({ ...u })), ocorrencias: gerarOcorrenciasSeed() }
}

export function carregarDb(): MockDb {
  try {
    const bruto = window.localStorage.getItem(CHAVE_DB)
    if (bruto) {
      const db = JSON.parse(bruto) as Partial<MockDb>
      if (db.versao === VERSAO_ATUAL && Array.isArray(db.usuarios) && Array.isArray(db.ocorrencias)) {
        return db as MockDb
      }
    }
  } catch {
    // JSON corrompido: re-seeda
  }
  const novo = semear()
  salvarDb(novo)
  return novo
}

export function salvarDb(db: MockDb): void {
  window.localStorage.setItem(CHAVE_DB, JSON.stringify(db))
}

export function resetarDb(): void {
  window.localStorage.removeItem(CHAVE_DB)
  window.localStorage.removeItem(CHAVE_SESSAO)
}
