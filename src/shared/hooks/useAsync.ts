import { useCallback, useEffect, useRef, useState } from 'react'
import { mensagemDeErro } from '../../services/api/errors'

export interface EstadoAsync<T> {
  dados: T | null
  erro: string | null
  carregando: boolean
  recarregar(): Promise<void>
}

/**
 * Executa `fn` ao montar (e quando `deps` mudam), ignorando respostas de execuções antigas.
 * Mantém os dados anteriores durante o recarregamento para a tela não piscar.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[]): EstadoAsync<T> {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const execucao = useRef(0)
  const fnRef = useRef(fn)
  fnRef.current = fn

  const recarregar = useCallback(async () => {
    const id = ++execucao.current
    setCarregando(true)
    try {
      const r = await fnRef.current()
      if (id !== execucao.current) return
      setDados(r)
      setErro(null)
    } catch (e) {
      if (id !== execucao.current) return
      setErro(mensagemDeErro(e))
    } finally {
      if (id === execucao.current) setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recarregar, ...deps])

  return { dados, erro, carregando, recarregar }
}
