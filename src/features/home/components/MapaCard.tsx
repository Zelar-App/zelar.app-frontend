import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { env } from '../../../app/env'
import type { Ocorrencia } from '../../../domain/types'
import { MapaBase } from '../../mapa/components/MapaBase'
import { PinOcorrencia } from '../../mapa/components/PinOcorrencia'

/** Card do mapa da Home: miniatura com os chamados e o botão “Navegar”. */
export function MapaCard({ ocorrencias }: { ocorrencias: Ocorrencia[] }) {
  const aberta = ocorrencias.find((o) => o.status !== 'RESOLVIDA') ?? ocorrencias[0]
  const centro: [number, number] = aberta ? [aberta.localizacao.latitude, aberta.localizacao.longitude] : env.mapCenter
  return (
    <section aria-label="Mapa" className="glass glass-glow relative h-56 overflow-hidden md:h-full md:min-h-[32rem]">
      <MapaBase key={centro.join(',')} centro={centro} zoom={14} estatico>
        {ocorrencias.map((o) => (
          <PinOcorrencia key={o.id} ocorrencia={o} ativo={o.id === aberta?.id} />
        ))}
      </MapaBase>
      <Link
        to="/mapa"
        className="absolute right-3 bottom-3 z-[500] inline-flex items-center gap-1 rounded-full bg-text px-4 py-2 text-sm font-semibold text-bg shadow-card hover:bg-white"
      >
        Navegar <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  )
}
