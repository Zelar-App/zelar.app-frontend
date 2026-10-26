import { MapPin, Search, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { ResultadoEndereco } from '../../../domain/types'
import { useApi } from '../../../services/api/useApi'
import { cn } from '../../../shared/lib/cn'
import { Spinner } from '../../../shared/ui'

export interface BuscaEnderecoProps {
  aoSelecionar: (r: ResultadoEndereco) => void
  className?: string
}

/**
 * Barra “Pesquisar endereços...” do mockup. Busca só no Enter/lupa
 * (política do Nominatim: nada de autocomplete por tecla).
 */
export function BuscaEndereco({ aoSelecionar, className }: BuscaEnderecoProps) {
  const api = useApi()
  const [consulta, setConsulta] = useState('')
  const [resultados, setResultados] = useState<ResultadoEndereco[] | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const controlador = useRef<AbortController | null>(null)

  useEffect(() => () => controlador.current?.abort(), [])

  async function buscar(e: FormEvent) {
    e.preventDefault()
    const q = consulta.trim()
    if (!q) return
    controlador.current?.abort()
    const ac = new AbortController()
    controlador.current = ac
    setBuscando(true)
    setErro(null)
    try {
      const r = await api.geocoding.buscar(q, ac.signal)
      if (!ac.signal.aborted) setResultados(r)
    } catch (err) {
      if (!ac.signal.aborted) setErro(err instanceof Error ? err.message : 'Não foi possível buscar agora.')
    } finally {
      if (!ac.signal.aborted) setBuscando(false)
    }
  }

  function limpar() {
    controlador.current?.abort()
    setConsulta('')
    setResultados(null)
    setErro(null)
    setBuscando(false)
  }

  function selecionar(r: ResultadoEndereco) {
    setResultados(null)
    setConsulta(r.rotulo)
    aoSelecionar(r)
  }

  const listaAberta = resultados !== null

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={buscar} role="search" className="glass flex h-13 items-center gap-2 rounded-full pr-2 pl-4">
        <button type="submit" aria-label="Buscar" className="text-text-muted hover:text-text">
          {buscando ? <Spinner className="size-5 text-primary" /> : <Search className="size-5" aria-hidden="true" />}
        </button>
        <input
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Pesquisar endereços..."
          aria-label="Pesquisar endereços"
          aria-expanded={listaAberta}
          aria-controls="resultados-endereco"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-text-muted"
        />
        {consulta && (
          <button type="button" aria-label="Limpar busca" onClick={limpar} className="rounded-full p-1.5 text-text-muted hover:bg-surface hover:text-text">
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </form>

      {(listaAberta || erro) && (
        <div className="glass absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-card p-1">
          {erro && <p className="px-3 py-2 text-sm text-danger">{erro}</p>}
          {resultados && resultados.length === 0 && <p className="px-3 py-2 text-sm text-text-muted">Nenhum endereço encontrado.</p>}
          {resultados && resultados.length > 0 && (
            <ul id="resultados-endereco" role="listbox" aria-label="Endereços encontrados">
              {resultados.map((r) => (
                <li key={`${r.latitude},${r.longitude}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => selecionar(r)}
                    className="flex w-full items-start gap-2 rounded-field px-3 py-2 text-left text-sm hover:bg-surface"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="line-clamp-2">{r.rotulo}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
