import { createContext } from 'react'
import type { Api } from './contracts'

export const ApiContext = createContext<Api | null>(null)
