import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useId, useState } from 'react'
import type { Ocorrencia, Prioridade } from '../../../domain/types'
import { PRIORIDADES, rotuloCategoria, rotuloPrioridade, rotuloStatus } from '../../../domain/constantes'
import { proximoStatus } from '../../../domain/ocorrencias/transicoes'
import { BottomSheet, Button, ErrorBanner, StatusBadge } from '../../../shared/ui'
import { CLASSE_CAMPO } from '../../../shared/ui/Input'

export interface AlterarStatusSheetProps {
  ocorrencia: Ocorrencia | null
  aoFechar: () => void
  aoSalvar: (id: string, dados: { status?: Ocorrencia['status']; prioridade?: Prioridade }) => Promise<void>
}

/** Só oferece o próximo status válido (ENVIADA → EM_ANALISE → RESOLVIDA) e a prioridade. */
export function AlterarStatusSheet({ ocorrencia, aoFechar, aoSalvar }: AlterarStatusSheetProps) {
  return (
    <BottomSheet aberto={ocorrencia !== null} aoFechar={aoFechar} titulo="Gerenciar ocorrência">
      {ocorrencia && <FormularioGerenciar key={ocorrencia.id} ocorrencia={ocorrencia} aoFechar={aoFechar} aoSalvar={aoSalvar} />}
    </BottomSheet>
  )
}

/** Estado por ocorrência: a `key` no pai reinicia o formulário a cada seleção. */
function FormularioGerenciar({ ocorrencia, aoFechar, aoSalvar }: AlterarStatusSheetProps & { ocorrencia: Ocorrencia }) {
  const id = useId()
  const [prioridade, setPrioridade] = useState<Prioridade | ''>(ocorrencia.prioridade ?? '')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  const proximo = proximoStatus(ocorrencia.status)
  const prioridadeMudou = (prioridade || null) !== (ocorrencia.prioridade ?? null)

  async function salvar(avancar: boolean) {
    const dados: { status?: Ocorrencia['status']; prioridade?: Prioridade } = {}
    if (avancar && proximo) dados.status = proximo
    if (prioridade && prioridadeMudou) dados.prioridade = prioridade
    if (!dados.status && !dados.prioridade) return aoFechar()
    setSalvando(true)
    setErro(null)
    try {
      await aoSalvar(ocorrencia.id, dados)
      aoFechar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-semibold">{rotuloCategoria(ocorrencia.categoria)}</p>
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">{ocorrencia.descricao}</p>
        <div className="mt-2">
          <StatusBadge status={ocorrencia.status} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-text-muted">
          Prioridade
        </label>
        <select
          id={id}
          value={prioridade}
          onChange={(e) => setPrioridade(e.target.value as Prioridade | '')}
          className={`${CLASSE_CAMPO} h-12`}
        >
          <option value="">Sem prioridade</option>
          {PRIORIDADES.map((p) => (
            <option key={p} value={p}>
              {rotuloPrioridade(p)}
            </option>
          ))}
        </select>
      </div>

      {erro && <ErrorBanner mensagem={erro} />}

      {proximo ? (
        <Button
          larguraTotal
          carregando={salvando}
          onClick={() => salvar(true)}
          icone={<ArrowRight className="size-5" aria-hidden="true" />}
        >
          Avançar para {rotuloStatus(proximo)}
        </Button>
      ) : (
        <p className="flex items-center gap-2 rounded-field border border-success/40 bg-success-soft p-3 text-sm text-success">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" /> Ocorrência encerrada: não há próximo status.
        </p>
      )}
      <Button variante="secundaria" larguraTotal carregando={salvando} disabled={!prioridadeMudou} onClick={() => salvar(false)}>
        Salvar só a prioridade
      </Button>
    </div>
  )
}
