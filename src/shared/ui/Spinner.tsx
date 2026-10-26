import { cn } from '../lib/cn'

export function Spinner({ className, rotulo = 'Carregando' }: { className?: string; rotulo?: string }) {
  return (
    <span
      role="status"
      aria-label={rotulo}
      className={cn('inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
    />
  )
}
