import { Bell, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { estimarDiasRestantes } from '../../../domain/ocorrencias/estimativa'
import { BottomSheet, ErrorBanner, IconButton } from '../../../shared/ui'
import { useAuth } from '../../auth/useAuth'
import { useOcorrencias } from '../../ocorrencias/hooks/useOcorrencias'
import { montarCaixaDeEntrada } from '../caixaDeEntrada'
import { CaixaEntradaCard, ListaCaixaEntrada } from '../components/CaixaEntradaCard'
import { EsperaCard } from '../components/EsperaCard'
import { MapaCard } from '../components/MapaCard'
import { ResumoCard } from '../components/ResumoCard'

export default function HomePage() {
  const { usuario } = useAuth()
  const { lista, erro } = useOcorrencias()
  const [caixaAberta, setCaixaAberta] = useState(false)

  const abertos = useMemo(() => lista.filter((o) => o.status !== 'RESOLVIDA').length, [lista])
  const resolvidos = lista.length - abertos
  const diasRestantes = useMemo(() => estimarDiasRestantes(lista), [lista])
  const caixaCompleta = useMemo(() => montarCaixaDeEntrada(lista), [lista])
  const caixaResumo = caixaCompleta.slice(0, 3)
  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0] ?? ''

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6 md:gap-6 md:px-6 md:pt-6 desktop:px-8">
      <header className="flex items-center justify-between">
        <Link to="/conta" aria-label="Minha conta">
          <IconButton rotulo="Minha conta" tamanho="lg" ativo tabIndex={-1} className="pointer-events-none">
            <User className="size-6" aria-hidden="true" />
          </IconButton>
        </Link>
        <div className="text-center">
          <p className="text-2xl font-bold">Bem Vindo(a)</p>
          <p className="text-lg font-semibold text-primary">{primeiroNome}</p>
        </div>
        <IconButton rotulo="Notificações" tamanho="lg" onClick={() => setCaixaAberta(true)}>
          <Bell className="size-6" aria-hidden="true" />
        </IconButton>
      </header>

      {erro && <ErrorBanner mensagem={erro} />}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)] md:items-stretch md:gap-6">
        <MapaCard ocorrencias={lista} />
        <div className="grid min-w-0 gap-4 md:grid-rows-[auto_1fr] md:gap-6">
          <div className="grid grid-cols-2 gap-3">
            <ResumoCard abertos={abertos} resolvidos={resolvidos} />
            <EsperaCard diasRestantes={diasRestantes} />
          </div>
          <CaixaEntradaCard mensagens={caixaResumo} aoAbrir={() => setCaixaAberta(true)} />
        </div>
      </div>

      <BottomSheet aberto={caixaAberta} aoFechar={() => setCaixaAberta(false)} titulo="Caixa de entrada">
        <ListaCaixaEntrada mensagens={caixaCompleta} />
      </BottomSheet>
    </div>
  )
}
