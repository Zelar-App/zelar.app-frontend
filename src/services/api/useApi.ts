import { useContext } from 'react'
import { ApiContext } from './apiContexto'
import type { Api } from './contracts'
import { getApi } from './index'

/** API injetada pelo ApiProvider; sem provider, o singleton do env. */
export function useApi(): Api {
  return useContext(ApiContext) ?? getApi()
}
