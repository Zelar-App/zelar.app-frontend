/** Latência simulada para a demo parecer uma API real. Zero em testes. */
export function atraso(ms?: number): Promise<void> {
  if (import.meta.env.MODE === 'test') return Promise.resolve()
  const tempo = ms ?? 150 + Math.random() * 250
  return new Promise((r) => setTimeout(r, tempo))
}
