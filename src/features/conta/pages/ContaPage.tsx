import { CalendarDays, ChevronRight, LogOut, Mail, Phone, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { resetarDb } from '../../../services/api/mock/db'
import { useApi } from '../../../services/api/useApi'
import { formatarData } from '../../../shared/lib/datas'
import { Avatar, Badge, BottomSheet, Button, GlassCard, PageHeader } from '../../../shared/ui'
import { useAuth } from '../../auth/useAuth'

export default function ContaPage() {
  const { usuario, ehAdmin, logout } = useAuth()
  const api = useApi()
  const navigate = useNavigate()
  const [confirmarReset, setConfirmarReset] = useState(false)
  const [saindo, setSaindo] = useState(false)

  if (!usuario) return null

  async function sair() {
    setSaindo(true)
    await logout()
    navigate('/login', { replace: true })
  }

  async function resetar() {
    resetarDb()
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-4xl pb-6">
      <PageHeader titulo="Conta" />
      <div className="grid gap-4 px-4 md:grid-cols-2 md:px-6">
        <GlassCard brilho className="flex flex-col items-center gap-3 py-6 text-center">
          <Avatar nome={usuario.nome} tamanho="xl" />
          <div>
            <h2 className="text-xl font-bold">{usuario.nome}</h2>
            <Badge tom={ehAdmin ? 'primario' : 'neutro'} className="mt-2">
              {ehAdmin ? 'Administrador' : 'Cidadão'}
            </Badge>
          </div>
        </GlassCard>

        <GlassCard semPadding>
          <dl className="divide-y divide-border">
            <div className="flex items-center gap-3 p-4">
              <Mail className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs text-text-dim">E-mail</dt>
                <dd className="truncate text-sm">{usuario.email}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Phone className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs text-text-dim">Telefone</dt>
                <dd className="text-sm">{usuario.telefone || <span className="text-text-dim">Não informado</span>}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <CalendarDays className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-xs text-text-dim">Conta criada em</dt>
                <dd className="text-sm">{formatarData(usuario.criadoEm)}</dd>
              </div>
            </div>
          </dl>
        </GlassCard>

        {ehAdmin && (
          <Link to="/admin" className="glass glass-glow flex items-center gap-3 p-4 hover:border-border-strong md:col-span-2">
            <ShieldCheck className="size-6 shrink-0 text-primary" aria-hidden="true" />
            <span className="flex-1 font-semibold">Painel administrativo</span>
            <ChevronRight className="size-5 text-text-muted" aria-hidden="true" />
          </Link>
        )}

        <div className="md:col-span-2">
          <Button variante="secundaria" larguraTotal carregando={saindo} onClick={sair} icone={<LogOut className="size-5" aria-hidden="true" />}>
            Sair da conta
          </Button>
        </div>

        {api.modo === 'mock' && (
          <GlassCard className="mt-2 md:col-span-2">
            <h3 className="text-sm font-semibold">Dados de demonstração</h3>
            <p className="mt-1 text-xs text-text-muted">
              Este app está rodando sem backend. Os chamados ficam salvos só neste navegador. Você pode voltar ao estado inicial a qualquer momento.
            </p>
            <Button
              variante="perigo"
              tamanho="sm"
              className="mt-3"
              onClick={() => setConfirmarReset(true)}
              icone={<RotateCcw className="size-4" aria-hidden="true" />}
            >
              Resetar dados demo
            </Button>
          </GlassCard>
        )}

        <BottomSheet aberto={confirmarReset} aoFechar={() => setConfirmarReset(false)} titulo="Resetar dados demo?">
          <p className="text-sm text-text-muted">Todos os chamados e contas criados neste navegador serão apagados e os dados iniciais voltam. Você precisará entrar de novo.</p>
          <div className="mt-4 flex gap-2">
            <Button variante="secundaria" larguraTotal onClick={() => setConfirmarReset(false)}>
              Cancelar
            </Button>
            <Button variante="perigo" larguraTotal onClick={resetar}>
              Sim, resetar
            </Button>
          </div>
        </BottomSheet>
      </div>
    </div>
  )
}
