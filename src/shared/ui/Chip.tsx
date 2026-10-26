import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selecionado?: boolean
  icone?: ReactNode
}

/** Chip selecionável para filtros e categorias. */
export function Chip({ selecionado = false, icone, className, children, type = 'button', ...resto }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selecionado}
      className={cn(
        'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all active:scale-95',
        selecionado
          ? 'border-primary bg-primary-soft text-primary shadow-glow'
          : 'border-border bg-surface/50 text-text-muted hover:border-border-strong hover:text-text',
        className,
      )}
      {...resto}
    >
      {icone}
      {children}
    </button>
  )
}
