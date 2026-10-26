import { CheckCircle2, MapPin } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'
import { rotuloCategoria } from '../../../domain/constantes'
import { formatarDataHora } from '../../../shared/lib/datas'
import { Button, ErrorBanner, GlassCard, PageHeader, PrioridadeBadge, Spinner, StatusBadge } from '../../../shared/ui'
import { MapaBase } from '../../mapa/components/MapaBase'
import { PinOcorrencia } from '../../mapa/components/PinOcorrencia'
import { TimelineStatus } from '../components/TimelineStatus'
import { useOcorrencia } from '../hooks/useOcorrencia'
import { ICONE_CATEGORIA } from '../icones'

export default function DetalheOcorrenciaPage() {
  const { id } = useParams()
  const location = useLocation()
  const criado = Boolean((location.state as { criado?: boolean } | null)?.criado)
  const { ocorrencia: o, erro, carregando } = useOcorrencia(id)

  if (carregando && !o) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center text-primary">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (erro || !o) {
    return (
      <div className="mx-auto max-w-6xl pb-6">
        <PageHeader titulo="Chamado" voltar="/historico" />
        <div className="px-4 md:px-6 desktop:px-8">
          <ErrorBanner mensagem={erro ?? 'Ocorrência não encontrada'} />
          <Link to="/historico" className="mt-4 inline-block">
            <Button variante="secundaria">Voltar ao histórico</Button>
          </Link>
        </div>
      </div>
    )
  }

  const Icone = ICONE_CATEGORIA[o.categoria]
  const endereco = o.localizacao.enderecoAproximado ?? `${o.localizacao.latitude.toFixed(5)}, ${o.localizacao.longitude.toFixed(5)}`

  return (
    <div className="mx-auto max-w-6xl pb-6">
      <PageHeader titulo="Chamado" subtitulo={`Aberto em ${formatarDataHora(o.criadoEm)}`} voltar="/historico" />
      <div className="grid gap-4 px-4 md:grid-cols-2 md:px-6 desktop:px-8">
        {criado && (
          <div role="status" className="flex items-center gap-3 rounded-field border border-success/40 bg-success-soft p-3 text-sm text-success md:col-span-2">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            <span>
              <strong>Chamado enviado!</strong> Você acompanha o andamento por aqui e na sua caixa de entrada.
            </span>
          </div>
        )}

        <GlassCard brilho>
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-strong text-primary">
              <Icone className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold">{rotuloCategoria(o.categoria)}</h2>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <StatusBadge status={o.status} />
                {o.prioridade && <PrioridadeBadge prioridade={o.prioridade} />}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{o.descricao}</p>
        </GlassCard>

        {o.fotoUrl && (
          <GlassCard semPadding className="overflow-hidden">
            <img src={o.fotoUrl} alt="Foto enviada com o chamado" className="max-h-72 w-full object-cover" />
          </GlassCard>
        )}

        <GlassCard semPadding className="overflow-hidden">
          <div className="h-40">
            <MapaBase centro={[o.localizacao.latitude, o.localizacao.longitude]} zoom={16} estatico>
              <PinOcorrencia ocorrencia={o} ativo />
            </MapaBase>
          </div>
          <p className="flex items-start gap-2 p-3 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{endereco}</span>
          </p>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-text-muted uppercase">Andamento</h3>
          <TimelineStatus historico={o.historico} />
        </GlassCard>
      </div>
    </div>
  )
}
