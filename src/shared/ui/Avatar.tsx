import { cn } from '../lib/cn'
import { iniciais } from '../lib/texto'

export function Avatar({ nome, tamanho = 'md', className }: { nome: string; tamanho?: 'md' | 'lg' | 'xl'; className?: string }) {
  const cls = { md: 'size-11 text-sm', lg: 'size-14 text-base', xl: 'size-24 text-3xl' }[tamanho]
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary-soft font-bold text-primary shadow-glow',
        cls,
        className,
      )}
    >
      {iniciais(nome)}
    </span>
  )
}
