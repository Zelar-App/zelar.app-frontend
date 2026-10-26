import type { ReactNode } from 'react'
import { ApiContext } from './apiContexto'
import type { Api } from './contracts'

/** Injeta a API (mock ou http). Sem provider explícito, usa o singleton do env. */
export function ApiProvider({ api, children }: { api: Api; children: ReactNode }) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}
