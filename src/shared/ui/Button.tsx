import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Spinner } from './Spinner'

type Variante = 'primaria' | 'secundaria' | 'fantasma' | 'perigo'
type Tamanho = 'md' | 'lg' | 'sm'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamanho?: Tamanho
  carregando?: boolean
  larguraTotal?: boolean
  icone?: ReactNode
}

const VARIANTES: Record<Variante, string> = {
  primaria: 'bg-primary text-bg shadow-glow hover:bg-[#33ddff] active:bg-primary-deep',
  secundaria: 'glass text-text hover:border-border-strong',
  fantasma: 'text-text-muted hover:bg-surface hover:text-text',
  perigo: 'bg-danger-soft text-danger border border-danger/40 hover:bg-danger/25',
}

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-12 px-5 text-base',
  lg: 'h-14 px-6 text-lg',
}

export function Button({
  variante = 'primaria',
  tamanho = 'md',
  carregando = false,
  larguraTotal = false,
  icone,
  className,
  children,
  disabled,
  type = 'button',
  ...resto
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
        VARIANTES[variante],
        TAMANHOS[tamanho],
        larguraTotal && 'w-full',
        className,
      )}
      {...resto}
    >
      {carregando ? <Spinner className="size-4" /> : icone}
      {children}
    </button>
  )
}
