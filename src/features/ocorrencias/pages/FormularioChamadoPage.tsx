import { MapPin, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import type { Categoria, Localizacao } from '../../../domain/types'
import { mensagemDeErro } from '../../../services/api'
import { useApi } from '../../../services/api/useApi'
import { Button, ErrorBanner, GlassCard, PageHeader, Textarea } from '../../../shared/ui'
import { CategoriaChips } from '../components/CategoriaChips'
import { FotoInput } from '../components/FotoInput'

const DESCRICAO_MAX = 1000

/** Passo 2 de “Abrir Chamado”: categoria, descrição e foto opcional (RF03). */
export default function FormularioChamadoPage() {
  const api = useApi()
  const navigate = useNavigate()
  const location = useLocation()
  const localizacao = (location.state as { localizacao?: Localizacao } | null)?.localizacao ?? null

  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [descricao, setDescricao] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [erros, setErros] = useState<{ categoria?: string; descricao?: string }>({})
  const [erroApi, setErroApi] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (!localizacao) return <Navigate to="/abrir-chamado" replace />

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    const v: typeof erros = {}
    if (!categoria) v.categoria = 'Escolha uma categoria'
    if (!descricao.trim()) v.descricao = 'Descreva o problema'
    else if (descricao.trim().length > DESCRICAO_MAX) v.descricao = `A descrição deve ter no máximo ${DESCRICAO_MAX} caracteres`
    setErros(v)
    setErroApi(null)
    if (Object.keys(v).length > 0 || !categoria || !localizacao) return
    setEnviando(true)
    try {
      const criada = await api.ocorrencias.criar({ categoria, descricao: descricao.trim(), localizacao, foto })
      navigate(`/historico/${criada.id}`, { replace: true, state: { criado: true } })
    } catch (err) {
      setErroApi(mensagemDeErro(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-6">
      <PageHeader titulo="Novo chamado" subtitulo="Conte o que está acontecendo" voltar="/abrir-chamado" />
      <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-5 px-4 md:px-6">
        <GlassCard className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">Local</p>
            <p className="text-sm">{localizacao.enderecoAproximado ?? `${localizacao.latitude.toFixed(5)}, ${localizacao.longitude.toFixed(5)}`}</p>
            <button type="button" onClick={() => navigate('/abrir-chamado')} className="mt-1 text-xs font-semibold text-primary">
              Alterar local
            </button>
          </div>
        </GlassCard>

        <CategoriaChips valor={categoria} aoMudar={setCategoria} erro={erros.categoria} />

        <Textarea
          rotulo="Descrição"
          placeholder="Ex.: buraco grande na faixa da direita, perto do ponto de ônibus."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          maxLength={DESCRICAO_MAX}
          erro={erros.descricao}
          dica={`${descricao.length}/${DESCRICAO_MAX}`}
          rows={4}
        />

        <FotoInput valor={foto} aoMudar={setFoto} />

        {erroApi && <ErrorBanner mensagem={erroApi} />}

        <Button type="submit" tamanho="lg" larguraTotal carregando={enviando} icone={<Send className="size-5" aria-hidden="true" />}>
          Enviar chamado
        </Button>
      </form>
    </div>
  )
}
