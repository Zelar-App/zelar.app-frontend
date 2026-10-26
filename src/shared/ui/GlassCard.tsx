import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  brilho?: boolean
  semPadding?: boolean
}

/** Card translúcido com borda luminosa, base de todos os blocos do mockup. */
export function GlassCard({ brilho = false, semPadding = false, className, ...resto }: GlassCardProps) {
  return <div className={cn('glass', brilho && 'glass-glow', !semPadding && 'p-4', className)} {...resto} />
}
