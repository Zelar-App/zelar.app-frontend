import { Inbox } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Ocorrencia, Prioridade, StatusOcorrencia } from '../../../domain/types'
import { useApi } from '../../../services/api/useApi'
import { useAsync } from '../../../shared/hooks/useAsync'
import { Button, EmptyState, ErrorBanner, Spinner } from '../../../shared/ui'
import { useOcorrencias } from '../../ocorrencias/hooks/useOcorrencias'
import { AlterarStatusSheet } from '../components/AlterarStatusSheet'
import { FiltrosOcorrencia } from '../components/FiltrosOcorrencia'
import { IndicadoresCards } from '../components/IndicadoresCards'
import { ListaAdmin } from '../components/ListaAdmin'

export default function AdminPage() {
  const api = useApi()
  const { lista, erro, carregando, recarregar } = useOcorrencias()
  const indicadores = useAsync(() => api.ocorrencias.indicadores(), [api])
  const [status, setStatus] = useState<StatusOcorrencia | null>(null)
  const [prioridade, setPrioridade] = useState<Prioridade | null>(null)
  const [selecionada, setSelecionada] = useState<Ocorrencia | null>(null)

  const visiveis = useMemo(
    () => lista.filter((o) => (!status || o.status === status) && (!prioridade || o.prioridade === prioridade)),
    [lista, status, prioridade],
  )

  async function salvar(id: string, dados: { status?: StatusOcorrencia; prioridade?: Prioridade }) {
    await api.ocorrencias.atualizar(id, dados)
    await Promise.all([recarregar(), indicadores.recarregar()])
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div>
        <h2 className="text-2xl font-bold md:text-3xl">Ocorrências</h2>
        <p className="text-sm text-text-muted">Acompanhe, priorize e atualize o status dos chamados da cidade.</p>
      </div>

      <IndicadoresCards indicadores={indicadores.dados} />

      <FiltrosOcorrencia status={status} prioridade={prioridade} aoMudarStatus={setStatus} aoMudarPrioridade={setPrioridade} />

      {(erro || indicadores.erro) && (
        <ErrorBanner
          mensagem={erro ?? indicadores.erro}
          acao={
            <Button tamanho="sm" variante="fantasma" onClick={() => void Promise.all([recarregar(), indicadores.recarregar()])}>
              Tentar de novo
            </Button>
          }
        />
      )}
      {carregando && lista.length === 0 && (
        <div className="flex justify-center py-10 text-primary">
          <Spinner className="size-8" />
        </div>
      )}
      {!carregando && !erro && visiveis.length === 0 && (
        <EmptyState icone={<Inbox className="size-7" aria-hidden="true" />} titulo="Nenhuma ocorrência com esses filtros" descricao="Ajuste os filtros para ver outros chamados." />
      )}
      {visiveis.length > 0 && <ListaAdmin lista={visiveis} aoGerenciar={setSelecionada} />}

      <AlterarStatusSheet ocorrencia={selecionada} aoFechar={() => setSelecionada(null)} aoSalvar={salvar} />
    </div>
  )
}
