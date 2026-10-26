import { beforeEach, describe, expect, it } from 'vitest'
import { carregarDb, resetarDb, salvarDb, CHAVE_DB } from './db'

describe('mock db', () => {
  beforeEach(() => window.localStorage.clear())

  it('semeia na primeira carga e persiste no localStorage', () => {
    const db = carregarDb()
    expect(db.usuarios.length).toBe(2)
    expect(db.ocorrencias.length).toBeGreaterThanOrEqual(8)
    expect(window.localStorage.getItem(CHAVE_DB)).toContain('"versao"')
  })

  it('mantém alterações salvas entre cargas e re-seeda quando a versão muda', () => {
    const db = carregarDb()
    db.ocorrencias = []
    salvarDb(db)
    expect(carregarDb().ocorrencias).toEqual([])
    window.localStorage.setItem(CHAVE_DB, JSON.stringify({ ...db, versao: 0 }))
    expect(carregarDb().ocorrencias.length).toBeGreaterThanOrEqual(8)
    resetarDb()
    expect(carregarDb().ocorrencias.length).toBeGreaterThanOrEqual(8)
  })
})
