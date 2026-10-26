import { useEffect, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import type { Coordenada } from '../../../shared/hooks/useGeolocation'
import { COR_STATUS } from '../../../shared/ui/tons'
import { MapaBase } from './MapaBase'

export interface SeletorLocalProps {
  centro: Coordenada
  aoMover: (c: Coordenada) => void
  aoPronto?: (mapa: L.Map) => void
  zoom?: number
}

/** Avisa o centro atual sempre que o usuário solta o mapa. */
function RastrearCentro({ aoMover }: { aoMover: (c: Coordenada) => void }) {
  useMapEvents({
    moveend: (e) => {
      const c = e.target.getCenter()
      aoMover([c.lat, c.lng])
    },
  })
  return null
}

/** Segue o `centro` controlado externamente (GPS, busca) sem disparar loop. */
function SeguirCentro({ centro }: { centro: Coordenada }) {
  const mapa = useMap()
  const ultimo = useRef<Coordenada | null>(null)
  useEffect(() => {
    const atual = mapa.getCenter()
    const mesmo = Math.abs(atual.lat - centro[0]) < 1e-6 && Math.abs(atual.lng - centro[1]) < 1e-6
    if (mesmo || (ultimo.current && ultimo.current[0] === centro[0] && ultimo.current[1] === centro[1])) return
    ultimo.current = centro
    mapa.flyTo(centro, Math.max(mapa.getZoom(), 16), { duration: 0.6 })
  }, [mapa, centro])
  return null
}

/** Mapa com pin fixo no centro: o usuário arrasta o mapa até o ponto do problema. */
export function SeletorLocal({ centro, aoMover, aoPronto, zoom = 16 }: SeletorLocalProps) {
  return (
    <div className="relative h-full w-full">
      <MapaBase centro={centro} zoom={zoom} aoPronto={aoPronto}>
        <RastrearCentro aoMover={aoMover} />
        <SeguirCentro centro={centro} />
      </MapaBase>
      <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center" aria-hidden="true">
        <div className="pin pin-ativo -translate-y-1/2" style={{ ['--pin' as string]: COR_STATUS.ENVIADA }}>
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 43C18 43 33 27.5 33 17A15 15 0 0 0 3 17C3 27.5 18 43 18 43Z" fill={COR_STATUS.ENVIADA} stroke="#ffffff" strokeWidth="2" />
            <path d="M19.5 9.5 12.5 19h5l-1 7.5 7-9.5h-5l1-7.5Z" fill="#ffffff" />
          </svg>
        </div>
      </div>
    </div>
  )
}
