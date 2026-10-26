import { Check, CircleAlert, Construction, Footprints, Leaf, Lightbulb, Send, Settings, Trash2, Waves, type LucideIcon } from 'lucide-react'
import type { Categoria, StatusOcorrencia } from '../../domain/types'

/** Ícones da caixa de entrada do mockup: avião (enviada), engrenagem (em análise), check (resolvida). */
export const ICONE_STATUS: Record<StatusOcorrencia, LucideIcon> = {
  ENVIADA: Send,
  EM_ANALISE: Settings,
  RESOLVIDA: Check,
}

export const ICONE_CATEGORIA: Record<Categoria, LucideIcon> = {
  BURACO: Construction,
  ILUMINACAO: Lightbulb,
  LIXO: Trash2,
  ALAGAMENTO: Waves,
  CALCADA: Footprints,
  SINALIZACAO: CircleAlert,
  AMBIENTAL: Leaf,
}
