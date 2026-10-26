import { ChevronRight, MapPin, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { Ocorrencia, StatusOcorrencia } from '../../../domain/types'
import { rotuloCategoria } from '../../../domain/constantes'
import { formatarDataHora } from '../../../shared/lib/datas'
import { BottomSheet, Button, Chip, ErrorBanner, PrioridadeBadge, Spinner, StatusBadge } from '../../../shared/ui'
import { FILTROS_STATUS } from '../../ocorrencias/filtros'
import { useOcorrencias } from '../../ocorrencias/hooks/useOcorrencias'
import { ICONE_CATEGORIA } from '../../ocorrencias/icones'
import { BotaoLocalizar } from '../components/BotaoLocalizar'
import { MapaBase } from '../components/MapaBase'
import { PinOcorrencia } from '../components/PinOcorrencia'

export default function MapaPage() {
  const { lista, erro, carregando } = useOcorrencias()
  const [mapa, setMapa] = useState<L.Map | null>(null)
  const [erroGeo, setErroGeo] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<StatusOcorrencia | null>(null)
  const [selecionada, setSelecionada] = useState<Ocorrencia | null>(null)

  const visiveis = useMemo(() => (filtro ? lista.filter((o) => o.status === filtro) : lista), [lista, filtro])
  const Icone = selecionada ? ICONE_CATEGORIA[selecionada.categoria] : null

  return (
    <div className="relative h-[calc(100dvh-var(--spacing-tabbar)-env(safe-area-inset-bottom))]">
      <MapaBase aoPronto={setMapa}>
        {visiveis.map((o) => (
          <PinOcorrencia key={o.id} ocorrencia={o} ativo={o.id === selecionada?.id} aoClicar={setSelecionada} />
        ))}
      </MapaBase>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex flex-col gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {FILTROS_STATUS.map((f) => (
            <Chip key={f.rotulo} selecionado={filtro === f.valor} onClick={() => setFiltro(f.valor)} className="glass h-9 px-3">
              {f.rotulo}
            </Chip>
          ))}
        </div>
        {carregando && lista.length === 0 && (
          <div className="glass pointer-events-auto flex items-center gap-2 self-start px-3 py-2 text-sm text-text-muted">
            <Spinner className="size-4 text-primary" /> Carregando chamados…
          </div>
        )}
        {erro && <ErrorBanner className="pointer-events-auto" mensagem={erro} />}
        {erroGeo && <ErrorBanner className="pointer-events-auto" mensagem={erroGeo} />}
      </div>

      <div className="absolute inset-x-4 bottom-4 z-[1000] flex items-end justify-between gap-3">
        <Link to="/abrir-chamado" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-bg shadow-glow hover:bg-[#33ddff]">
          <Plus className="size-5" aria-hidden="true" /> Abrir chamado aqui
        </Link>
        <BotaoLocalizar mapa={mapa} aoErro={setErroGeo} aoLocalizar={() => setErroGeo(null)} />
      </div>

      <BottomSheet aberto={selecionada !== null} aoFechar={() => setSelecionada(null)} titulo={selecionada ? rotuloCategoria(selecionada.categoria) : ''}>
        {selecionada && Icone && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={selecionada.status} />
              {selecionada.prioridade && <PrioridadeBadge prioridade={selecionada.prioridade} />}
              <span className="text-xs text-text-dim">{formatarDataHora(selecionada.criadoEm)}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-strong text-primary">
                <Icone className="size-6" aria-hidden="true" />
              </span>
              <p className="line-clamp-3 text-sm leading-relaxed">{selecionada.descricao}</p>
            </div>
            {selecionada.localizacao.enderecoAproximado && (
              <p className="flex items-start gap-2 text-sm text-text-muted">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{selecionada.localizacao.enderecoAproximado}</span>
              </p>
            )}
            <Link to={`/historico/${selecionada.id}`}>
              <Button larguraTotal icone={<ChevronRight className="size-5" aria-hidden="true" />}>
                Ver detalhes
              </Button>
            </Link>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
