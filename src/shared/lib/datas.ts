const MS_POR_DIA = 86_400_000

const fmtData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const fmtDataHora = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatarData = (iso: string): string => fmtData.format(new Date(iso))
export const formatarHora = (iso: string): string => fmtHora.format(new Date(iso))
export const formatarDataHora = (iso: string): string => fmtDataHora.format(new Date(iso))

export function diasAtras(iso: string, agora: Date = new Date()): number {
  return Math.floor((agora.getTime() - new Date(iso).getTime()) / MS_POR_DIA)
}

export function agoraIso(): string {
  return new Date().toISOString()
}

export function horasAtrasIso(horas: number, agora: Date = new Date()): string {
  return new Date(agora.getTime() - horas * 3_600_000).toISOString()
}
