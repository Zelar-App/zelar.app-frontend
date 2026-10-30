import { useEffect, useState } from 'react'
import type { Ocorrencia } from '../../../domain/types'
import { mensagemDeErro } from '../../../services/api/errors'
import { useApi } from '../../../services/api/useApi'
import { Button, ErrorBanner, GlassCard } from '../../../shared/ui'
import { FotoInput } from './FotoInput'

/** Os bytes privados são buscados com Bearer; a URL temporária não sobrevive à tela. */
export function FotografiaOcorrencia({ ocorrencia, podeEnviar, aoAtualizar }: { ocorrencia: Ocorrencia; podeEnviar: boolean; aoAtualizar: () => Promise<void> }) {
  const api = useApi()
  const [url, setUrl] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [processando, setProcessando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!ocorrencia.possuiFotografia || ocorrencia.fotoUrl || !api.ocorrencias.buscarFotografia) return
    const abortar = new AbortController()
    let temporaria: string | undefined
    void api.ocorrencias.buscarFotografia(ocorrencia.id, abortar.signal).then((blob) => {
      if (abortar.signal.aborted) return
      temporaria = URL.createObjectURL(blob)
      setUrl(temporaria)
    }).catch((error: unknown) => {
      if (!abortar.signal.aborted) setErro(mensagemDeErro(error))
    })
    return () => {
      abortar.abort()
      if (temporaria) URL.revokeObjectURL(temporaria)
    }
  }, [api, ocorrencia.id, ocorrencia.possuiFotografia, ocorrencia.fotoUrl])

  async function enviar() {
    if (!foto || processando || enviando || !api.ocorrencias.enviarFotografia) return
    setEnviando(true)
    setErro(null)
    try {
      await api.ocorrencias.enviarFotografia(ocorrencia.id, foto)
      setFoto(null)
      await aoAtualizar()
    } catch (error) {
      setErro(mensagemDeErro(error))
    } finally {
      setEnviando(false)
    }
  }

  const fonte = ocorrencia.fotoUrl ?? url
  if (fonte) return <GlassCard semPadding className="overflow-hidden"><img src={fonte} alt="Foto enviada com o chamado" className="max-h-72 w-full object-cover" /></GlassCard>
  if (ocorrencia.possuiFotografia) return <GlassCard>{erro ? <ErrorBanner mensagem={erro} /> : <p role="status">Carregando foto…</p>}</GlassCard>
  if (!podeEnviar || !api.ocorrencias.enviarFotografia) return null
  return (
    <GlassCard className="flex flex-col gap-3">
      <FotoInput valor={foto} aoMudar={setFoto} aoProcessamentoMudar={setProcessando} />
      {erro && <ErrorBanner mensagem={erro} />}
      <Button variante="secundaria" disabled={!foto || processando} carregando={enviando} onClick={() => void enviar()}>Anexar foto ao chamado</Button>
    </GlassCard>
  )
}
