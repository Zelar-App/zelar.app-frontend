import { useCallback, useEffect, useState } from 'react'
import { env } from '../../../app/env'
import type { Localizacao } from '../../../domain/types'
import { useApi } from '../../../services/api/useApi'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import type { Coordenada } from '../../../shared/hooks/useGeolocation'

export interface EscolherLocal {
  centro: Coordenada
  /** Endereço da posição atual; null enquanto ainda não foi resolvido para ela. */
  endereco: string | null
  buscandoEndereco: boolean
  moverPara(c: Coordenada): void
  confirmar(): Localizacao
}

/** Diferença abaixo disso é o próprio Leaflet devolvendo o centro após um flyTo, não o usuário. */
const TOLERANCIA = 1e-5

/**
 * Estado do passo “escolher local”: centro do mapa + endereço aproximado
 * (geocodificação reversa com atraso para respeitar o limite do Nominatim).
 * O endereço só é considerado válido quando foi resolvido para o centro atual.
 */
export function useEscolherLocal({ inicial = env.mapCenter, atrasoMs = 800 }: { inicial?: Coordenada; atrasoMs?: number } = {}): EscolherLocal {
  const api = useApi()
  const [centro, setCentro] = useState<Coordenada>(inicial)
  const [resolvido, setResolvido] = useState<{ centro: Coordenada; endereco: string | null } | null>(null)
  const centroEstavel = useDebouncedValue(centro, atrasoMs)

  useEffect(() => {
    let ativo = true
    api.geocoding
      .reverso(centroEstavel[0], centroEstavel[1])
      .then((r) => ativo && setResolvido({ centro: centroEstavel, endereco: r }))
      .catch(() => ativo && setResolvido({ centro: centroEstavel, endereco: null }))
    return () => {
      ativo = false
    }
  }, [api, centroEstavel])

  // `useDebouncedValue` repassa a mesma referência, então a igualdade por referência é segura.
  const atualizado = resolvido !== null && resolvido.centro === centro
  const endereco = atualizado ? resolvido.endereco : null
  const buscandoEndereco = !atualizado

  const moverPara = useCallback((c: Coordenada) => {
    setCentro((atual) => (Math.abs(atual[0] - c[0]) < TOLERANCIA && Math.abs(atual[1] - c[1]) < TOLERANCIA ? atual : c))
  }, [])

  const confirmar = useCallback(
    (): Localizacao => ({ latitude: centro[0], longitude: centro[1], enderecoAproximado: endereco }),
    [centro, endereco],
  )

  return { centro, endereco, buscandoEndereco, moverPara, confirmar }
}
