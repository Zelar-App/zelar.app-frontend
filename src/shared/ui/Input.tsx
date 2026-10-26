import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string
  erro?: string | null
  dica?: string
  iconeEsquerda?: ReactNode
}

export const CLASSE_CAMPO =
  'w-full rounded-field border border-border bg-surface/60 px-4 text-text placeholder:text-text-dim ' +
  'transition-colors focus:border-primary focus:outline-none focus:shadow-glow aria-[invalid=true]:border-danger'

export function Input({ rotulo, erro, dica, iconeEsquerda, className, id, ...resto }: InputProps) {
  const idGerado = useId()
  const idCampo = id ?? idGerado
  const idErro = `${idCampo}-erro`
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={idCampo} className="text-sm font-medium text-text-muted">
        {rotulo}
      </label>
      <div className="relative">
        {iconeEsquerda && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-text-dim">{iconeEsquerda}</span>
        )}
        <input
          id={idCampo}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? idErro : undefined}
          className={cn(CLASSE_CAMPO, 'h-12', iconeEsquerda ? 'pl-11' : null)}
          {...resto}
        />
      </div>
      {erro ? (
        <p id={idErro} role="alert" className="text-sm text-danger">
          {erro}
        </p>
      ) : dica ? (
        <p className="text-xs text-text-dim">{dica}</p>
      ) : null}
    </div>
  )
}
