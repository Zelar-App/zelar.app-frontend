import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Texto acessível obrigatório: o botão só tem ícone. */
  rotulo: string
  ativo?: boolean
  tamanho?: 'md' | 'lg'
}

/** Botão circular de ícone, como o avatar e o sino do cabeçalho do mockup. */
export function IconButton({ rotulo, ativo = false, tamanho = 'md', className, children, type = 'button', ...resto }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={rotulo}
      title={rotulo}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border transition-all',
        'bg-surface/60 backdrop-blur-md hover:border-border-strong active:scale-95',
        ativo ? 'border-primary text-primary shadow-glow' : 'border-border text-text',
        tamanho === 'lg' ? 'size-14' : 'size-11',
        className,
      )}
      {...resto}
    >
      {children}
    </button>
  )
}
