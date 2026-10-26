import type {
  AtualizarOcorrenciaInput,
  CadastroInput,
  FiltroOcorrencias,
  Indicadores,
  LoginInput,
  NovaOcorrenciaInput,
  Ocorrencia,
  ResultadoEndereco,
  SessaoAuth,
  Usuario,
} from '../../domain/types'

export interface AuthRepository {
  /** POST /api/v1/usuarios — 201 | 409 */
  cadastrar(input: CadastroInput): Promise<Usuario>
  /** POST /api/v1/auth/login */
  login(input: LoginInput): Promise<SessaoAuth>
  /** Lê a sessão salva localmente (e valida no backend quando houver). */
  restaurarSessao(): Promise<SessaoAuth | null>
  logout(): Promise<void>
}

export interface OcorrenciaRepository {
  /** POST /api/v1/ocorrencias — nasce ENVIADA */
  criar(input: NovaOcorrenciaInput): Promise<Ocorrencia>
  /** GET /api/v1/ocorrencias?status=&prioridade=&categoria= — mais recentes primeiro */
  listar(filtro?: FiltroOcorrencias): Promise<Ocorrencia[]>
  /** GET /api/v1/ocorrencias/{id} */
  buscarPorId(id: string): Promise<Ocorrencia>
  /** PUT /api/v1/ocorrencias/{id} — só ADMINISTRADOR */
  atualizar(id: string, input: AtualizarOcorrenciaInput): Promise<Ocorrencia>
  /** GET /api/v1/ocorrencias/indicadores */
  indicadores(): Promise<Indicadores>
}

export interface GeocodingService {
  buscar(consulta: string, sinal?: AbortSignal): Promise<ResultadoEndereco[]>
  reverso(latitude: number, longitude: number): Promise<string | null>
}

export interface Api {
  modo: 'mock' | 'http'
  auth: AuthRepository
  ocorrencias: OcorrenciaRepository
  geocoding: GeocodingService
}
