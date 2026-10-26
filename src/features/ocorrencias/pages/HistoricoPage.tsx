import { FileText, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { StatusOcorrencia } from '../../../domain/types'
import { Button, Chip, EmptyState, ErrorBanner, PageHeader, Spinner } from '../../../shared/ui'
import { OcorrenciaListItem } from '../components/OcorrenciaListItem'
import { FILTROS_STATUS } from '../filtros'
import { useOcorrencias } from '../hooks/useOcorrencias'

export default function HistoricoPage() {
  const { lista, erro, carregando, recarregar } = useOcorrencias()
  const [filtro, setFiltro] = useState<StatusOcorrencia | null>(null)
  const visiveis = useMemo(() => (filtro ? lista.filter((o) => o.status === filtro) : lista), [lista, filtro])

  return (
    <div className="mx-auto max-w-6xl pb-6">
      <PageHeader titulo="Histórico" subtitulo={`${lista.length} chamado${lista.length === 1 ? '' : 's'}`} />

      <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:px-6 desktop:px-8">
        {FILTROS_STATUS.map((f) => (
          <Chip key={f.rotulo} selecionado={filtro === f.valor} onClick={() => setFiltro(f.valor)}>
            {f.rotulo}
          </Chip>
        ))}
      </div>

      <div className="px-4 md:px-6 desktop:px-8">
        {erro && <ErrorBanner mensagem={erro} acao={<Button tamanho="sm" variante="fantasma" onClick={recarregar}>Tentar de novo</Button>} />}
        {carregando && lista.length === 0 && (
          <div className="flex justify-center py-10 text-primary">
            <Spinner className="size-8" />
          </div>
        )}
        {!carregando && !erro && visiveis.length === 0 && (
          <EmptyState
            icone={<FileText className="size-7" aria-hidden="true" />}
            titulo={filtro ? 'Nenhum chamado com esse status' : 'Nenhum chamado ainda'}
            descricao={filtro ? 'Tente outro filtro.' : 'Abra seu primeiro chamado pelo botão central e acompanhe tudo por aqui.'}
            acao={
              !filtro && (
                <Link to="/abrir-chamado">
                  <Button icone={<Plus className="size-5" aria-hidden="true" />}>Abrir chamado</Button>
                </Link>
              )
            }
          />
        )}
        {visiveis.length > 0 && (
          <ul className="grid gap-3 md:grid-cols-2" aria-label="Meus chamados">
            {visiveis.map((o) => (
              <OcorrenciaListItem key={o.id} ocorrencia={o} href={`/historico/${o.id}`} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
