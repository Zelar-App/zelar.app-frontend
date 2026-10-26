import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface EmptyStateProps {
  icone?: ReactNode
  titulo: string
  descricao?: string
  acao?: ReactNode
  className?: string
}

export function EmptyState({ icone, titulo, descricao, acao, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
      {icone && <div className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">{icone}</div>}
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {descricao && <p className="max-w-xs text-sm text-text-muted">{descricao}</p>}
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  )
}
