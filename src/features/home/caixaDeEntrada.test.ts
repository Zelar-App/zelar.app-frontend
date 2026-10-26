import { describe, expect, it } from 'vitest'
import type { Ocorrencia } from '../../domain/types'
import { montarCaixaDeEntrada } from './caixaDeEntrada'

const oc = (id: string, historico: Ocorrencia['historico']): Ocorrencia => ({
  id,
  usuarioId: 'u',
  categoria: 'BURACO',
  descricao: '',
  localizacao: { latitude: 0, longitude: 0 },
  status: historico.at(-1)!.status,
  criadoEm: historico[0].data,
  atualizadoEm: historico.at(-1)!.data,
  historico,
})

describe('montarCaixaDeEntrada', () => {
  it('junta os eventos de todas as ocorrências, mais recentes primeiro, limitado', () => {
    const lista = [
      oc('a', [
        { status: 'ENVIADA', data: '2026-10-10T09:12:00Z', mensagem: 'enviada A' },
        { status: 'EM_ANALISE', data: '2026-10-10T10:24:00Z', mensagem: 'analise A' },
      ]),
      oc('b', [
        { status: 'ENVIADA', data: '2026-10-09T08:00:00Z', mensagem: 'enviada B' },
        { status: 'EM_ANALISE', data: '2026-10-09T12:00:00Z', mensagem: 'analise B' },
        { status: 'RESOLVIDA', data: '2026-10-10T14:37:00Z', mensagem: 'resolvida B' },
      ]),
    ]
    const caixa = montarCaixaDeEntrada(lista, 3)
    expect(caixa.map((m) => m.mensagem)).toEqual(['resolvida B', 'analise A', 'enviada A'])
    expect(caixa[0]).toMatchObject({ ocorrenciaId: 'b', status: 'RESOLVIDA', data: '2026-10-10T14:37:00Z' })
  })

  it('lista vazia devolve vazio', () => {
    expect(montarCaixaDeEntrada([], 3)).toEqual([])
  })
})
