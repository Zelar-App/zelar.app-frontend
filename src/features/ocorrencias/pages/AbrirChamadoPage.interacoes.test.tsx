import { StrictMode } from 'react'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BotaoLocalizarProps } from '../../mapa/components/BotaoLocalizar'
import type { BuscaEnderecoProps } from '../../mapa/components/BuscaEndereco'
import type { SeletorLocalProps } from '../../mapa/components/SeletorLocal'
import { renderComProviders } from '../../../test/helpers'
import AbrirChamadoPage from './AbrirChamadoPage'

const estado = vi.hoisted(() => ({
  localizar: vi.fn(), moverPara: vi.fn(), confirmar: vi.fn(),
  local: { centro: [1, 2] as [number, number], buscandoEndereco: false, endereco: null as string | null },
  seletor: {} as SeletorLocalProps,
}))
vi.mock('../../../shared/hooks/useGeolocation', () => ({ useGeolocation: () => ({ localizar: estado.localizar }) }))
vi.mock('../hooks/useEscolherLocal', () => ({ useEscolherLocal: () => ({ ...estado.local, moverPara: estado.moverPara, confirmar: estado.confirmar }) }))
vi.mock('../../mapa/components/SeletorLocal', () => ({ SeletorLocal: (props: SeletorLocalProps) => { estado.seletor = props; return <div>Seletor</div> } }))
vi.mock('../../mapa/components/BuscaEndereco', () => ({ BuscaEndereco: ({ aoSelecionar }: BuscaEnderecoProps) => <button onClick={() => aoSelecionar({ latitude: 3, longitude: 4, rotulo: 'Rua' })}>Escolher endereço</button> }))
vi.mock('../../mapa/components/BotaoLocalizar', () => ({ BotaoLocalizar: ({ aoErro, aoLocalizar }: BotaoLocalizarProps) => <><button onClick={() => aoErro?.('GPS sem sinal')}>Falhar GPS</button><button onClick={() => aoLocalizar?.([5, 6])}>Localizar</button></> }))

beforeEach(() => {
  vi.clearAllMocks()
  estado.local = { centro: [1, 2], buscandoEndereco: false, endereco: null }
  estado.localizar.mockResolvedValue({ posicao: [1, 2] })
  estado.confirmar.mockReturnValue({ latitude: 1, longitude: 2, enderecoAproximado: null })
})
afterEach(() => vi.restoreAllMocks())

describe('seleção de localização do chamado', () => {
  it('pede GPS uma vez mesmo em StrictMode, aceita busca e GPS manual e limpa erro', async () => {
    renderComProviders(<StrictMode><AbrirChamadoPage /></StrictMode>)
    await waitFor(() => expect(estado.moverPara).toHaveBeenCalledWith([1, 2]))
    expect(estado.localizar).toHaveBeenCalledOnce()
    expect(screen.getByText('1.00000, 2.00000')).toBeInTheDocument()
    act(() => estado.seletor.aoPronto?.({} as L.Map))
    act(() => estado.seletor.aoMover([7, 8]))
    expect(estado.moverPara).toHaveBeenCalledWith([7, 8])
    await userEvent.click(screen.getByRole('button', { name: 'Escolher endereço' }))
    expect(estado.moverPara).toHaveBeenCalledWith([3, 4])
    await userEvent.click(screen.getByRole('button', { name: 'Falhar GPS' }))
    expect(screen.getByRole('alert')).toHaveTextContent('GPS sem sinal')
    await userEvent.click(screen.getByRole('button', { name: 'Localizar' }))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(estado.moverPara).toHaveBeenCalledWith([5, 6])
  })

  it('não altera centro quando GPS falha e bloqueia confirmação enquanto resolve endereço', async () => {
    estado.local.buscandoEndereco = true
    estado.localizar.mockResolvedValue({ posicao: null, erro: 'Sem GPS' })
    renderComProviders(<AbrirChamadoPage />)
    await waitFor(() => expect(estado.localizar).toHaveBeenCalledOnce())
    expect(estado.moverPara).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Confirmar este local' })).toBeDisabled()
    expect(screen.getByText('Identificando endereço…')).toBeInTheDocument()
  })
})
