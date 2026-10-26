import { useEffect, useState } from 'react'

/** Devolve `valor` só depois de `atrasoMs` sem novas mudanças. */
export function useDebouncedValue<T>(valor: T, atrasoMs: number): T {
  const [atrasado, setAtrasado] = useState(valor)
  useEffect(() => {
    const t = window.setTimeout(() => setAtrasado(valor), atrasoMs)
    return () => window.clearTimeout(t)
  }, [valor, atrasoMs])
  return atrasado
}
