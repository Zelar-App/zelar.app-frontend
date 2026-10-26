import { useMemo } from 'react'
import { Marker } from 'react-leaflet'
import type { Ocorrencia } from '../../../domain/types'
import { rotuloCategoria } from '../../../domain/constantes'
import { iconePin } from './iconePin'

export function PinOcorrencia({ ocorrencia, ativo = false, aoClicar }: { ocorrencia: Ocorrencia; ativo?: boolean; aoClicar?: (o: Ocorrencia) => void }) {
  const icone = useMemo(() => iconePin(ocorrencia.status, { ativo }), [ocorrencia.status, ativo])
  return (
    <Marker
      position={[ocorrencia.localizacao.latitude, ocorrencia.localizacao.longitude]}
      icon={icone}
      title={rotuloCategoria(ocorrencia.categoria)}
      eventHandlers={aoClicar ? { click: () => aoClicar(ocorrencia) } : undefined}
    />
  )
}
