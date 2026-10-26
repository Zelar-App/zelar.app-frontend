import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { env } from '../../../app/env'
import { cn } from '../../../shared/lib/cn'
import type { Coordenada } from '../../../shared/hooks/useGeolocation'

export interface MapaBaseProps {
  centro?: Coordenada
  zoom?: number
  /** Mapa “parado” para miniaturas: sem arrastar, zoom ou controles. */
  estatico?: boolean
  className?: string
  children?: ReactNode
  aoPronto?: (mapa: L.Map) => void
}

/**
 * OpenStreetMap padrão escurecido por filtro CSS (ver `.tiles-dark` no tema).
 * O CARTO Dark Matter passou a exigir chave de API; o OSM não exige, só atribuição.
 */
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATRIBUICAO = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

/** Leaflet calcula o tamanho só uma vez; ao trocar de aba ou redimensionar, recalcula. */
function AjustarTamanho() {
  const mapa = useMap()
  useEffect(() => {
    const el = mapa.getContainer()
    const ajustar = () => mapa.invalidateSize({ animate: false })
    const t = window.setTimeout(ajustar, 0)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(ajustar) : null
    ro?.observe(el)
    return () => {
      window.clearTimeout(t)
      ro?.disconnect()
    }
  }, [mapa])
  return null
}

function AoPronto({ aoPronto }: { aoPronto?: (mapa: L.Map) => void }) {
  const mapa = useMap()
  useEffect(() => {
    aoPronto?.(mapa)
  }, [mapa, aoPronto])
  return null
}

export function MapaBase({ centro = env.mapCenter, zoom = 14, estatico = false, className, children, aoPronto }: MapaBaseProps) {
  return (
    <MapContainer
      center={centro}
      zoom={zoom}
      zoomControl={false}
      attributionControl
      dragging={!estatico}
      scrollWheelZoom={!estatico}
      doubleClickZoom={!estatico}
      touchZoom={!estatico}
      keyboard={!estatico}
      className={cn('isolate h-full w-full bg-bg', estatico && 'pointer-events-none', className)}
    >
      <TileLayer url={TILES} attribution={ATRIBUICAO} maxZoom={19} className="tiles-dark" />
      <AjustarTamanho />
      <AoPronto aoPronto={aoPronto} />
      {children}
    </MapContainer>
  )
}
