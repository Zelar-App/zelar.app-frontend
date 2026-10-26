import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '../lib/cn'
import { IconButton } from './IconButton'

export interface PageHeaderProps {
  titulo: string
  subtitulo?: string
  voltar?: boolean | string
  acao?: ReactNode
  className?: string
}

export function PageHeader({ titulo, subtitulo, voltar, acao, className }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <header
      className={cn(
        'flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 md:px-6 md:pt-6 desktop:px-8',
        className,
      )}
    >
      {voltar && (
        <IconButton rotulo="Voltar" onClick={() => (typeof voltar === 'string' ? navigate(voltar) : navigate(-1))}>
          <ArrowLeft className="size-5" aria-hidden="true" />
        </IconButton>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-bold md:text-3xl">{titulo}</h1>
        {subtitulo && <p className="truncate text-sm text-text-muted">{subtitulo}</p>}
      </div>
      {acao}
    </header>
  )
}
