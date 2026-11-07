import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FotoInput } from './FotoInput'

describe('FotoInput', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:foto'), revokeObjectURL: vi.fn() })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('ignora seleção cancelada e rejeita arquivo acima de 10 MB antes de comprimir', async () => {
    const comprimir = vi.fn(), aoMudar = vi.fn()
    render(<FotoInput valor={null} aoMudar={aoMudar} comprimir={comprimir} />)
    const campo = screen.getByLabelText('Adicionar foto')
    fireEvent.change(campo, { target: { files: null } })
    fireEvent.change(campo, { target: { files: [] } })
    const arquivo = new File(['x'], 'grande.jpg', { type: 'image/jpeg' })
    Object.defineProperty(arquivo, 'size', { value: 10 * 1024 * 1024 + 1 })
    await userEvent.upload(campo, arquivo)
    expect(screen.getByRole('alert')).toHaveTextContent('máx. 10 MB')
    expect(comprimir).not.toHaveBeenCalled(); expect(aoMudar).not.toHaveBeenCalled()
  })

  it.each([new Error(''), 'erro desconhecido'])('usa mensagem segura quando conversão não explica a falha (%s)', async (erro) => {
    const processamento = vi.fn()
    render(<FotoInput valor={null} aoMudar={vi.fn()} aoProcessamentoMudar={processamento} comprimir={async () => { throw erro }} />)
    await userEvent.upload(screen.getByLabelText('Adicionar foto'), new File(['x'], 'f.jpg', { type: 'image/jpeg' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível ler a imagem.')
    expect(processamento.mock.calls).toEqual([[true], [false]])
  })

  it('aceita uma imagem, comprime para JPEG e devolve o arquivo comprimido', async () => {
    const aoMudar = vi.fn()
    const comprimido = new File(['c'], 'buraco.jpg', { type: 'image/jpeg' })
    const comprimir = vi.fn(async () => comprimido)
    render(<FotoInput valor={null} aoMudar={aoMudar} comprimir={comprimir} />)
    const input = screen.getByLabelText('Adicionar foto') as HTMLInputElement
    expect(input).toHaveAttribute('accept', 'image/*')
    expect(input).toHaveAttribute('capture', 'environment')
    const arquivo = new File(['x'], 'buraco.heic', { type: 'image/heic' })
    await userEvent.upload(input, arquivo)
    expect(comprimir).toHaveBeenCalledWith(arquivo)
    await waitFor(() => expect(aoMudar).toHaveBeenCalledWith(comprimido))
  })

  it('se a imagem não puder ser lida, avisa e não devolve arquivo', async () => {
    const aoMudar = vi.fn()
    const comprimir = async () => Promise.reject(new Error('Não foi possível ler a imagem'))
    render(<FotoInput valor={null} aoMudar={aoMudar} comprimir={comprimir} />)
    await userEvent.upload(screen.getByLabelText('Adicionar foto'), new File(['x'], 'f.heic', { type: 'image/heic' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/ler a imagem/)
    expect(aoMudar).not.toHaveBeenCalled()
  })

  it('com valor mostra a prévia e o botão de remover', async () => {
    const aoMudar = vi.fn()
    render(<FotoInput valor={new File(['x'], 'f.jpg', { type: 'image/jpeg' })} aoMudar={aoMudar} />)
    expect(screen.getByRole('img', { name: 'Prévia da foto' })).toHaveAttribute('src', 'blob:foto')
    await userEvent.click(screen.getByRole('button', { name: 'Remover foto' }))
    expect(aoMudar).toHaveBeenCalledWith(null)
  })

  it('rejeita arquivo que não é imagem', async () => {
    const aoMudar = vi.fn()
    render(<FotoInput valor={null} aoMudar={aoMudar} />)
    const input = screen.getByLabelText('Adicionar foto')
    await userEvent.upload(input, new File(['x'], 'doc.pdf', { type: 'application/pdf' }), { applyAccept: false })
    expect(aoMudar).not.toHaveBeenCalled()
    expect(await screen.findByRole('alert')).toHaveTextContent(/imagem/i)
  })
})
