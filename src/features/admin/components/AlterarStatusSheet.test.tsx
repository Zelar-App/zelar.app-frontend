import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Ocorrencia } from '../../../domain/types'
import { AlterarStatusSheet } from './AlterarStatusSheet'

const ocorrencia: Ocorrencia = {
  id: 'o1', usuarioId: 'u1', categoria: 'BURACO', descricao: 'Buraco na via',
  localizacao: { latitude: 1, longitude: 2 }, status: 'ENVIADA', prioridade: 'ALTA',
  criadoEm: '2026-10-20', atualizadoEm: '2026-10-20', historico: [],
}

describe('AlterarStatusSheet', () => {
  it('não oferece limpeza de prioridade já persistida', async () => {
    const aoSalvar = vi.fn(async () => {})
    const aoFechar = vi.fn()
    render(<AlterarStatusSheet ocorrencia={ocorrencia} aoSalvar={aoSalvar} aoFechar={aoFechar} />)
    expect(screen.getByRole('option', { name: 'Sem prioridade' })).toBeDisabled()
    await userEvent.selectOptions(screen.getByLabelText('Prioridade'), '')
    expect(screen.getByLabelText('Prioridade')).toHaveValue('ALTA')
    expect(screen.getByRole('button', { name: 'Salvar só a prioridade' })).toBeDisabled()
    expect(aoSalvar).not.toHaveBeenCalled()
    expect(aoFechar).not.toHaveBeenCalled()
  })

  it('não fecha nem aparenta sucesso se receber uma limpeza inválida de prioridade', async () => {
    const aoSalvar = vi.fn(async () => {})
    const aoFechar = vi.fn()
    render(<AlterarStatusSheet ocorrencia={ocorrencia} aoSalvar={aoSalvar} aoFechar={aoFechar} />)
    fireEvent.change(screen.getByLabelText('Prioridade'), { target: { value: '' } })
    await userEvent.click(screen.getByRole('button', { name: 'Salvar só a prioridade' }))
    expect(aoFechar).not.toHaveBeenCalled()
    expect(aoSalvar).not.toHaveBeenCalled()
    expect(await screen.findByRole('alert')).toHaveTextContent(/prioridade/i)
  })

  it('permite definir a primeira prioridade de uma ocorrência sem prioridade', async () => {
    const aoSalvar = vi.fn(async () => {})
    const aoFechar = vi.fn()
    render(<AlterarStatusSheet ocorrencia={{ ...ocorrencia, prioridade: null }} aoSalvar={aoSalvar} aoFechar={aoFechar} />)
    await userEvent.selectOptions(screen.getByLabelText('Prioridade'), 'MEDIA')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar só a prioridade' }))
    await waitFor(() => expect(aoSalvar).toHaveBeenCalledWith('o1', { prioridade: 'MEDIA' }))
    expect(aoFechar).toHaveBeenCalledTimes(1)
  })
})
