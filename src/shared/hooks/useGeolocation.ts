import { useCallback, useState } from 'react'

export type Coordenada = [number, number]

export type ResultadoGeo = { posicao: Coordenada; erro: null } | { posicao: null; erro: string }

export interface Geolocalizacao {
  posicao: Coordenada | null
  erro: string | null
  carregando: boolean
  /** Pede a posição atual. O resultado traz a posição ou a mensagem de erro (também refletidos no estado). */
  localizar(): Promise<ResultadoGeo>
}

function mensagemDoErro(e: GeolocationPositionError): string {
  switch (e.code) {
    case 1:
      return 'Permissão de localização negada. Você pode escolher o local no mapa.'
    case 2:
      return 'Não foi possível obter sua localização agora.'
    case 3:
      return 'A localização demorou demais. Tente de novo ou escolha no mapa.'
    default:
      return 'Erro ao obter a localização.'
  }
}

export function useGeolocation(): Geolocalizacao {
  const [posicao, setPosicao] = useState<Coordenada | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const localizar = useCallback((): Promise<ResultadoGeo> => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const msg = 'Este dispositivo não suporta geolocalização.'
      setErro(msg)
      return Promise.resolve({ posicao: null, erro: msg })
    }
    setCarregando(true)
    setErro(null)
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const c: Coordenada = [p.coords.latitude, p.coords.longitude]
          setPosicao(c)
          setCarregando(false)
          resolve({ posicao: c, erro: null })
        },
        (e) => {
          const msg = mensagemDoErro(e)
          setErro(msg)
          setCarregando(false)
          resolve({ posicao: null, erro: msg })
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
      )
    })
  }, [])

  return { posicao, erro, carregando, localizar }
}
