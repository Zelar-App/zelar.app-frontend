import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/cn'

export interface BottomSheetProps {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  children: ReactNode
  className?: string
}

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Painel que sobe da base da tela (padrão mobile). Fecha no X, no fundo escuro e no Escape.
 * Ao abrir, o foco entra no painel e fica preso nele; ao fechar, volta para quem o abriu.
 */
export function BottomSheet({ aberto, aoFechar, titulo, children, className }: BottomSheetProps) {
  const idTitulo = useId()
  const painel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    const gatilho = document.activeElement as HTMLElement | null
    const el = painel.current
    const focaveis = () => Array.from(el?.querySelectorAll<HTMLElement>(FOCAVEIS) ?? [])
    focaveis()[0]?.focus()

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        aoFechar()
        return
      }
      if (e.key !== 'Tab' || !el) return
      const lista = focaveis()
      if (lista.length === 0) {
        e.preventDefault()
        return
      }
      const primeiro = lista[0]
      const ultimo = lista[lista.length - 1]
      const ativo = document.activeElement
      if (e.shiftKey && (ativo === primeiro || !el.contains(ativo))) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && (ativo === ultimo || !el.contains(ativo))) {
        e.preventDefault()
        primeiro.focus()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflowAnterior
      gatilho?.focus?.()
    }
  }, [aberto, aoFechar])

  if (!aberto) return null

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-end justify-center md:items-center md:p-6">
      <button type="button" aria-label="Fechar painel" tabIndex={-1} onClick={aoFechar} className="absolute inset-0 bg-bg/70 backdrop-blur-sm" />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className={cn(
          'safe-bottom relative w-full max-w-md rounded-t-card border border-b-0 border-border bg-bg-elevated shadow-card md:max-w-lg md:rounded-card md:border-b',
          'animate-[subir_.25s_ease-out] motion-reduce:animate-none',
          className,
        )}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-border-strong md:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h2 id={idTitulo} className="text-lg font-semibold">
            {titulo}
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={aoFechar}
            className="rounded-full p-2 text-text-muted hover:bg-surface hover:text-text"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[70dvh] overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
