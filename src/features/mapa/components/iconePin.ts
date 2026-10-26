import L from 'leaflet'
import type { StatusOcorrencia } from '../../../domain/types'
import { COR_STATUS } from '../../../shared/ui/tons'

export const PIN_LARGURA = 36
export const PIN_ALTURA = 44

/**
 * Pin com raio, como no mockup: gota colorida pelo status e halo luminoso.
 * divIcon com SVG inline evita o problema do marker-icon.png no Vite.
 */
export function iconePin(status: StatusOcorrencia, { ativo = false }: { ativo?: boolean } = {}): L.DivIcon {
  const cor = COR_STATUS[status]
  const html = `
<div class="pin${ativo ? ' pin-ativo' : ''}" style="--pin:${cor}">
  <svg width="${PIN_LARGURA}" height="${PIN_ALTURA}" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M18 43C18 43 33 27.5 33 17A15 15 0 0 0 3 17C3 27.5 18 43 18 43Z" fill="${cor}" stroke="#ffffff" stroke-width="2"/>
    <path d="M19.5 9.5 12.5 19h5l-1 7.5 7-9.5h-5l1-7.5Z" fill="#ffffff"/>
  </svg>
</div>`
  return L.divIcon({
    html,
    className: 'pin-ocorrencia',
    iconSize: [PIN_LARGURA, PIN_ALTURA],
    iconAnchor: [PIN_LARGURA / 2, PIN_ALTURA],
    popupAnchor: [0, -PIN_ALTURA],
  })
}
