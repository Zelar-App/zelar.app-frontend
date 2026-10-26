import { MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useGeolocation } from '../../../shared/hooks/useGeolocation'
import { Button, ErrorBanner, GlassCard, Spinner } from '../../../shared/ui'
import { BotaoLocalizar } from '../../mapa/components/BotaoLocalizar'
import { BuscaEndereco } from '../../mapa/components/BuscaEndereco'
import { SeletorLocal } from '../../mapa/components/SeletorLocal'
import { useEscolherLocal } from '../hooks/useEscolherLocal'

/** Passo 1 de “Abrir Chamado”: escolher o local no mapa (tela cheia, como no mockup). */
export default function AbrirChamadoPage() {
  const navigate = useNavigate()
  const local = useEscolherLocal()
  const geo = useGeolocation()
  const [mapa, setMapa] = useState<L.Map | null>(null)
  const [erroGeo, setErroGeo] = useState<string | null>(null)
  const pediuGps = useRef(false)

  // Ao abrir, tenta o GPS uma vez; se falhar, fica no centro padrão sem alarde.
  useEffect(() => {
    if (pediuGps.current) return
    pediuGps.current = true
    void geo.localizar().then((r) => {
      if (r.posicao) local.moverPara(r.posicao)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function confirmar() {
    navigate('/abrir-chamado/formulario', { state: { localizacao: local.confirmar() } })
  }

  return (
    <div className="relative h-[calc(100dvh-var(--spacing-tabbar)-env(safe-area-inset-bottom))]">
      <SeletorLocal centro={local.centro} aoMover={local.moverPara} aoPronto={setMapa} />

      <div className="absolute inset-x-0 top-0 z-[1000] flex flex-col gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))] md:left-1/2 md:right-auto md:w-full md:max-w-2xl md:-translate-x-1/2 md:p-6">
        <BuscaEndereco aoSelecionar={(r) => local.moverPara([r.latitude, r.longitude])} />
        {erroGeo && <ErrorBanner mensagem={erroGeo} />}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[1000] flex flex-col items-end gap-3 p-4 md:left-auto md:right-0 md:w-full md:max-w-md md:p-6">
        <BotaoLocalizar mapa={mapa} aoErro={setErroGeo} aoLocalizar={(c) => { setErroGeo(null); local.moverPara(c) }} />
        <GlassCard brilho className="w-full">
          <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">Local do chamado</p>
          <p className="mt-1 flex min-h-10 items-start gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {local.buscandoEndereco ? (
              <span className="flex items-center gap-2 text-text-muted">
                <Spinner className="size-4" /> Identificando endereço…
              </span>
            ) : (
              <span className="line-clamp-2">{local.endereco ?? `${local.centro[0].toFixed(5)}, ${local.centro[1].toFixed(5)}`}</span>
            )}
          </p>
          <p className="mt-1 text-xs text-text-dim">Arraste o mapa até o ponto exato do problema.</p>
          <Button larguraTotal className="mt-3" onClick={confirmar} disabled={local.buscandoEndereco}>
            Confirmar este local
          </Button>
        </GlassCard>
      </div>
    </div>
  )
}
