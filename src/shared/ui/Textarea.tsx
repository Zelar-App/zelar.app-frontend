import { useId, type TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/cn'
import { CLASSE_CAMPO } from './Input'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  rotulo: string
  erro?: string | null
  dica?: string
}

export function Textarea({ rotulo, erro, dica, className, id, rows = 4, ...resto }: TextareaProps) {
  const idGerado = useId()
  const idCampo = id ?? idGerado
  const idErro = `${idCampo}-erro`
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={idCampo} className="text-sm font-medium text-text-muted">
        {rotulo}
      </label>
      <textarea
        id={idCampo}
        rows={rows}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : undefined}
        className={cn(CLASSE_CAMPO, 'resize-y py-3 leading-relaxed')}
        {...resto}
      />
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
