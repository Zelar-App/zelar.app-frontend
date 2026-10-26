import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface ErrorBannerProps {
  mensagem: ReactNode
  acao?: ReactNode
  className?: string
}

export function ErrorBanner({ mensagem, acao, className }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 rounded-field border border-danger/40 bg-danger-soft p-3 text-sm text-danger', className)}
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="flex-1">{mensagem}</div>
      {acao}
    </div>
  )
}
