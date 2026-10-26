export type Perfil = 'CIDADAO' | 'ADMINISTRADOR'
export type StatusOcorrencia = 'ENVIADA' | 'EM_ANALISE' | 'RESOLVIDA'
export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA'
export type Categoria =
  | 'BURACO'
  | 'ILUMINACAO'
  | 'LIXO'
  | 'ALAGAMENTO'
  | 'CALCADA'
  | 'SINALIZACAO'
  | 'AMBIENTAL'

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
  telefone?: string | null
  criadoEm: string // ISO 8601
}

export interface Localizacao {
  latitude: number
  longitude: number
  enderecoAproximado?: string | null
}

export interface HistoricoStatus {
  status: StatusOcorrencia
  data: string // ISO 8601
  mensagem: string
}

export interface Ocorrencia {
  id: string
  usuarioId: string
  categoria: Categoria
  descricao: string
  localizacao: Localizacao
  fotoUrl?: string | null
  status: StatusOcorrencia
  prioridade?: Prioridade | null
  criadoEm: string
  atualizadoEm: string
  historico: HistoricoStatus[]
}

export interface CadastroInput {
  nome: string
  email: string
  senha: string
  telefone?: string
}

export interface LoginInput {
  email: string
  senha: string
}

export interface SessaoAuth {
  token: string
  usuario: Usuario
}

export interface NovaOcorrenciaInput {
  categoria: Categoria
  descricao: string
  localizacao: Localizacao
  foto?: File | null
}

export interface AtualizarOcorrenciaInput {
  status?: StatusOcorrencia
  prioridade?: Prioridade
}

export interface FiltroOcorrencias {
  status?: StatusOcorrencia
  prioridade?: Prioridade
  categoria?: Categoria
  usuarioId?: string
}

export interface Indicadores {
  totalOcorrencias: number
  totalEnviadas: number
  totalEmAnalise: number
  totalResolvidas: number
}

export interface ResultadoEndereco {
  rotulo: string
  latitude: number
  longitude: number
}
