import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export type TomBadge = 'primario' | 'sucesso' | 'alerta' | 'perigo' | 'neutro'

const TONS_BADGE: Record<TomBadge, string> = {
  primario: 'bg-primary-soft text-primary border-primary/40',
  sucesso: 'bg-success-soft text-success border-success/40',
  alerta: 'bg-warning-soft text-warning border-warning/40',
  perigo: 'bg-danger-soft text-danger border-danger/40',
  neutro: 'bg-surface-strong text-text-muted border-border',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tom?: TomBadge
}

export function Badge({ tom = 'neutro', className, ...resto }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        TONS_BADGE[tom],
        className,
      )}
      {...resto}
    />
  )
}
