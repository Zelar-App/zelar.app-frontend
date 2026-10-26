export interface OpcoesCompressao {
  maxLado?: number
  qualidade?: number
}

/**
 * Redimensiona a imagem no canvas (máx. `maxLado` px) e devolve um data URL JPEG.
 * Só roda no navegador; o mock recebe esta função por injeção para permitir testes.
 */
export function comprimirImagem(arquivo: File, { maxLado = 1024, qualidade = 0.7 }: OpcoesCompressao = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * escala)
      canvas.height = Math.round(img.height * escala)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas indisponível'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', qualidade))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem'))
    }
    img.src = url
  })
}

/** Comprime e devolve um `File` JPEG, para o mesmo arquivo servir ao mock (data URL) e ao http (multipart). */
export async function comprimirParaJpeg(arquivo: File, opcoes: OpcoesCompressao = {}): Promise<File> {
  const dataUrl = await comprimirImagem(arquivo, opcoes)
  const blob = await (await fetch(dataUrl)).blob()
  const nome = arquivo.name.replace(/\.[^.]+$/, '') || 'foto'
  return new File([blob], nome + '.jpg', { type: 'image/jpeg', lastModified: Date.now() })
}

/** Lê o arquivo como data URL, sem transformar (o mock guarda isso no localStorage). */
export function lerComoDataUrl(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(String(leitor.result))
    leitor.onerror = () => reject(new Error('Não foi possível ler a imagem'))
    leitor.readAsDataURL(arquivo)
  })
}
