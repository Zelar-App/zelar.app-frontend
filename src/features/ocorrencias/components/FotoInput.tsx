import { Camera, X } from 'lucide-react'
import { useEffect, useId, useState, type ChangeEvent } from 'react'
import { comprimirParaJpeg } from '../../../shared/lib/imagem'
import { Spinner } from '../../../shared/ui'

export interface FotoInputProps {
  valor: File | null
  aoMudar: (f: File | null) => void
  /** Conversor da imagem escolhida (padrão: canvas → JPEG ≤ 1024px). Injetável para testes. */
  comprimir?: (arquivo: File) => Promise<File>
}

const TAMANHO_MAX = 10 * 1024 * 1024 // 10 MB antes da compressão

/**
 * Foto opcional: abre a câmera traseira no celular, comprime na escolha (vale para mock e http),
 * mostra prévia e permite remover.
 */
export function FotoInput({ valor, aoMudar, comprimir = comprimirParaJpeg }: FotoInputProps) {
  const id = useId()
  const [erro, setErro] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)
  const [previa, setPrevia] = useState<string | null>(null)

  useEffect(() => {
    const url = valor ? URL.createObjectURL(valor) : null
    // oxlint-disable-next-line react/set-state-in-effect -- sincroniza com um recurso externo (object URL) que precisa ser revogado
    setPrevia(url)
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [valor])

  async function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setErro('Envie um arquivo de imagem (JPG, PNG ou HEIC).')
      return
    }
    if (f.size > TAMANHO_MAX) {
      setErro('A imagem é muito grande (máx. 10 MB).')
      return
    }
    setErro(null)
    setProcessando(true)
    try {
      aoMudar(await comprimir(f))
    } catch (err) {
      setErro(err instanceof Error && err.message ? err.message : 'Não foi possível ler a imagem.')
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text-muted">Foto (opcional)</span>
      {valor && previa ? (
        <div className="relative overflow-hidden rounded-card border border-border">
          <img src={previa} alt="Prévia da foto" className="max-h-64 w-full object-cover" />
          <button
            type="button"
            aria-label="Remover foto"
            onClick={() => aoMudar(null)}
            className="absolute top-2 right-2 rounded-full bg-bg/80 p-2 text-text backdrop-blur hover:bg-danger hover:text-white"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border-strong bg-surface/40 text-text-muted transition-colors hover:border-primary hover:text-primary"
        >
          {processando ? <Spinner className="size-6 text-primary" /> : <Camera className="size-7" aria-hidden="true" />}
          <span className="text-sm font-medium">{processando ? 'Preparando foto…' : 'Adicionar foto'}</span>
        </label>
      )}
      <input
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={aoEscolher}
        aria-label="Adicionar foto"
        disabled={processando}
      />
      {erro && (
        <p role="alert" className="text-sm text-danger">
          {erro}
        </p>
      )}
    </div>
  )
}
