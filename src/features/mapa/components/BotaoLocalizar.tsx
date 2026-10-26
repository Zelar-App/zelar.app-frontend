import { LocateFixed } from 'lucide-react'
import { useGeolocation, type Coordenada } from '../../../shared/hooks/useGeolocation'
import { cn } from '../../../shared/lib/cn'
import { IconButton, Spinner } from '../../../shared/ui'

export interface BotaoLocalizarProps {
  mapa: L.Map | null
  zoom?: number
  aoLocalizar?: (c: Coordenada) => void
  aoErro?: (mensagem: string) => void
  className?: string
}

/** Botão flutuante “minha localização”: pede o GPS e centraliza o mapa. */
export function BotaoLocalizar({ mapa, zoom = 16, aoLocalizar, aoErro, className }: BotaoLocalizarProps) {
  const geo = useGeolocation()

  async function clicar() {
    const r = await geo.localizar()
    if (!r.posicao) {
      aoErro?.(r.erro)
      return
    }
    mapa?.flyTo(r.posicao, zoom, { duration: 0.8 })
    aoLocalizar?.(r.posicao)
  }

  return (
    <IconButton
      rotulo="Usar minha localização"
      onClick={clicar}
      disabled={geo.carregando}
      ativo={geo.posicao !== null}
      tamanho="lg"
      className={cn('shadow-card', className)}
    >
      {geo.carregando ? <Spinner className="size-5" /> : <LocateFixed className="size-6" aria-hidden="true" />}
    </IconButton>
  )
}
