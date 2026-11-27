import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { comprimirImagem, comprimirParaJpeg, lerComoDataUrl } from './imagem'

let imagem: HTMLImageElement
const criarUrl = vi.fn(() => 'blob:foto')
const revogar = vi.fn()
const desenhar = vi.fn()
const urlOriginal = URL

beforeEach(() => {
  imagem = document.createElement('img')
  imagem.width = 2000
  imagem.height = 1000
  vi.stubGlobal('Image', vi.fn(function () { return imagem }))
  vi.stubGlobal('URL', class extends urlOriginal {
    static createObjectURL = criarUrl
    static revokeObjectURL = revogar
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: desenhar } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,AQID')
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks() })

describe('preparação de imagem', () => {
  it('redimensiona preservando proporção e libera URL temporária', async () => {
    const resposta = comprimirImagem(new File(['x'], 'foto.png'))
    imagem.dispatchEvent(new Event('load'))
    await expect(resposta).resolves.toBe('data:image/jpeg;base64,AQID')
    expect(desenhar).toHaveBeenCalledWith(imagem, 0, 0, 1024, 512)
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.7)
    expect(revogar).toHaveBeenCalledWith('blob:foto')
  })

  it('não amplia imagem menor e respeita opções explícitas', async () => {
    imagem.width = 100; imagem.height = 50
    const resposta = comprimirImagem(new File(['x'], 'foto.png'), { maxLado: 500, qualidade: 0.5 })
    imagem.dispatchEvent(new Event('load'))
    await resposta
    expect(desenhar).toHaveBeenCalledWith(imagem, 0, 0, 100, 50)
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.5)
  })

  it('recusa canvas indisponível', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    const resposta = comprimirImagem(new File(['x'], 'foto.png'))
    const verificacao = expect(resposta).rejects.toThrow('Canvas indisponível')
    imagem.dispatchEvent(new Event('load'))
    await verificacao
  })

  it('informa falha de decodificação e libera a URL', async () => {
    const resposta = comprimirImagem(new File(['x'], 'foto.png'))
    const verificacao = expect(resposta).rejects.toThrow(/ler a imagem/)
    imagem.dispatchEvent(new Event('error'))
    await verificacao
    expect(revogar).toHaveBeenCalledWith('blob:foto')
  })

  it.each(['arquivo.png', '.png'])('produz File JPEG com nome seguro para %s', async (nome) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ blob: async () => new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' }) }))
    const resposta = comprimirParaJpeg(new File(['x'], nome))
    imagem.dispatchEvent(new Event('load'))
    const arquivo = await resposta
    expect(arquivo.name).toBe(nome === '.png' ? 'foto.jpg' : 'arquivo.jpg')
    expect(arquivo.type).toBe('image/jpeg')
    expect(arquivo.size).toBe(3)
  })

  it('converte arquivo para data URL sem transformar', async () => {
    await expect(lerComoDataUrl(new File(['x'], 'foto.txt', { type: 'text/plain' }))).resolves.toMatch(/^data:text\/plain;base64,/)
  })

  it('informa erro de leitura do FileReader', async () => {
    const leitor = { onerror: null as null | (() => void), readAsDataURL: vi.fn() }
    vi.stubGlobal('FileReader', vi.fn(function () { return leitor }))
    const resposta = lerComoDataUrl(new File(['x'], 'foto.png'))
    const verificacao = expect(resposta).rejects.toThrow(/ler a imagem/)
    leitor.onerror?.()
    await verificacao
  })
})
