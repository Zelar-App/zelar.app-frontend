import type { Categoria, HistoricoStatus, Ocorrencia, Prioridade, StatusOcorrencia, Usuario } from '../../../domain/types'
import { mensagemPorStatus } from '../../../domain/ocorrencias/mensagens'
import { horasAtrasIso } from '../../../shared/lib/datas'

export interface UsuarioSeed extends Usuario {
  senha: string
}

export const USUARIOS_SEED: readonly UsuarioSeed[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    nome: 'Joana Silva',
    email: 'joana@zelar.app',
    senha: 'Senha@123',
    perfil: 'CIDADAO',
    telefone: '(31) 99999-0001',
    criadoEm: '2026-09-01T12:00:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    nome: 'Administração Zelar',
    email: 'admin@zelar.app',
    senha: 'Admin@123',
    perfil: 'ADMINISTRADOR',
    telefone: null,
    criadoEm: '2026-08-15T12:00:00.000Z',
  },
]

const OUTRO_USUARIO_ID = '33333333-3333-4333-8333-333333333333'
const JOANA_ID = USUARIOS_SEED[0].id

interface Semente {
  id: string
  usuarioId: string
  categoria: Categoria
  descricao: string
  lat: number
  lng: number
  endereco: string
  status: StatusOcorrencia
  prioridade?: Prioridade
  horasAtras: number
  fotoUrl?: string
}

const FOTO_DEMO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#1f2a3a"/><rect y="300" width="640" height="120" fill="#2c3747"/><ellipse cx="320" cy="340" rx="120" ry="40" fill="#0b1322"/><text x="320" y="200" font-family="sans-serif" font-size="32" fill="#9fb3c8" text-anchor="middle">Foto de demonstração</text></svg>',
  )

// Pontos num raio de ~2 km do centro de Belo Horizonte (-19.9167, -43.9345)
const SEMENTES: readonly Semente[] = [
  { id: 'a1', usuarioId: JOANA_ID, categoria: 'BURACO', descricao: 'Buraco grande na faixa da direita, perto do ponto de ônibus.', lat: -19.9208, lng: -43.9378, endereco: 'Av. Afonso Pena, 1500 - Centro', status: 'ENVIADA', horasAtras: 48, fotoUrl: FOTO_DEMO },
  { id: 'a2', usuarioId: JOANA_ID, categoria: 'ILUMINACAO', descricao: 'Poste apagado há três noites, rua fica totalmente escura.', lat: -19.9121, lng: -43.9402, endereco: 'Rua da Bahia, 980 - Centro', status: 'EM_ANALISE', prioridade: 'MEDIA', horasAtras: 120 },
  { id: 'a3', usuarioId: JOANA_ID, categoria: 'LIXO', descricao: 'Entulho acumulado na calçada bloqueando a passagem.', lat: -19.9254, lng: -43.9291, endereco: 'Rua Pernambuco, 350 - Funcionários', status: 'RESOLVIDA', prioridade: 'ALTA', horasAtras: 240 },
  { id: 'a4', usuarioId: JOANA_ID, categoria: 'SINALIZACAO', descricao: 'Placa de pare caída na esquina.', lat: -19.9095, lng: -43.9298, endereco: 'Av. do Contorno, 4200 - Funcionários', status: 'EM_ANALISE', prioridade: 'ALTA', horasAtras: 30 },
  { id: 'a5', usuarioId: JOANA_ID, categoria: 'CALCADA', descricao: 'Calçada quebrada com ferros expostos.', lat: -19.9302, lng: -43.9411, endereco: 'Rua Curitiba, 1200 - Centro', status: 'RESOLVIDA', prioridade: 'BAIXA', horasAtras: 360 },
  { id: 'b1', usuarioId: OUTRO_USUARIO_ID, categoria: 'ALAGAMENTO', descricao: 'Bueiro entupido alaga a rua toda vez que chove.', lat: -19.9187, lng: -43.9231, endereco: 'Av. Brasil, 700 - Santa Efigênia', status: 'ENVIADA', horasAtras: 10 },
  { id: 'b2', usuarioId: OUTRO_USUARIO_ID, categoria: 'AMBIENTAL', descricao: 'Árvore com risco de queda sobre a via.', lat: -19.9052, lng: -43.9360, endereco: 'Rua Rio de Janeiro, 2100 - Lourdes', status: 'EM_ANALISE', prioridade: 'ALTA', horasAtras: 72 },
  { id: 'b3', usuarioId: OUTRO_USUARIO_ID, categoria: 'BURACO', descricao: 'Vários buracos pequenos após obra da concessionária.', lat: -19.9330, lng: -43.9320, endereco: 'Av. Amazonas, 2800 - Barro Preto', status: 'ENVIADA', horasAtras: 6 },
]

function idCompleto(curto: string): string {
  return `${curto}000000-0000-4000-8000-000000000000`.slice(0, 36)
}

export function gerarOcorrenciasSeed(agora: Date = new Date()): Ocorrencia[] {
  return SEMENTES.map((s) => {
    const criadoEm = horasAtrasIso(s.horasAtras, agora)
    const historico: HistoricoStatus[] = [{ status: 'ENVIADA', data: criadoEm, mensagem: mensagemPorStatus('ENVIADA') }]
    let atualizadoEm = criadoEm
    if (s.status !== 'ENVIADA') {
      const data = horasAtrasIso(s.horasAtras * 0.6, agora)
      historico.push({ status: 'EM_ANALISE', data, mensagem: mensagemPorStatus('EM_ANALISE') })
      atualizadoEm = data
    }
    if (s.status === 'RESOLVIDA') {
      const data = horasAtrasIso(s.horasAtras * 0.2, agora)
      historico.push({ status: 'RESOLVIDA', data, mensagem: mensagemPorStatus('RESOLVIDA') })
      atualizadoEm = data
    }
    return {
      id: idCompleto(s.id),
      usuarioId: s.usuarioId,
      categoria: s.categoria,
      descricao: s.descricao,
      localizacao: { latitude: s.lat, longitude: s.lng, enderecoAproximado: s.endereco },
      fotoUrl: s.fotoUrl ?? null,
      status: s.status,
      prioridade: s.prioridade ?? null,
      criadoEm,
      atualizadoEm,
      historico,
    }
  })
}
