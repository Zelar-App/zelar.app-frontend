import { Bell, Search, Zap } from 'lucide-react'
import { useState } from 'react'
import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Chip,
  EmptyState,
  ErrorBanner,
  GlassCard,
  IconButton,
  Input,
  PageHeader,
  PrioridadeBadge,
  Spinner,
  StatusBadge,
  Textarea,
} from '../ui'

/** Vitrine dos componentes. Só é registrada em modo DEV. */
export default function DevUiPage() {
  const [sheet, setSheet] = useState(false)
  const [chip, setChip] = useState('BURACO')
  return (
    <div className="mx-auto max-w-md space-y-6 pb-24">
      <PageHeader titulo="Kit de UI" subtitulo="Somente em desenvolvimento" voltar="/" acao={<Avatar nome="Joana Silva" />} />
      <section className="space-y-3 px-4">
        <h2 className="text-sm font-semibold text-text-muted">Botões</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primário</Button>
          <Button variante="secundaria">Secundário</Button>
          <Button variante="fantasma">Fantasma</Button>
          <Button variante="perigo">Perigo</Button>
          <Button carregando>Enviando</Button>
          <Button disabled>Desabilitado</Button>
          <Button tamanho="sm" icone={<Zap className="size-4" />}>Pequeno</Button>
          <IconButton rotulo="Notificações">
            <Bell className="size-5" />
          </IconButton>
          <IconButton rotulo="Ativo" ativo>
            <Zap className="size-5" />
          </IconButton>
        </div>
      </section>
      <section className="space-y-3 px-4">
        <h2 className="text-sm font-semibold text-text-muted">Campos</h2>
        <Input rotulo="E-mail" placeholder="voce@exemplo.com" iconeEsquerda={<Search className="size-5" />} dica="Usamos só para login." />
        <Input rotulo="Senha" type="password" erro="A senha deve ter entre 8 e 72 caracteres" defaultValue="123" />
        <Textarea rotulo="Descrição" placeholder="Descreva o problema" />
      </section>
      <section className="space-y-3 px-4">
        <h2 className="text-sm font-semibold text-text-muted">Badges e chips</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="ENVIADA" />
          <StatusBadge status="EM_ANALISE" />
          <StatusBadge status="RESOLVIDA" />
          <PrioridadeBadge prioridade="BAIXA" />
          <PrioridadeBadge prioridade="MEDIA" />
          <PrioridadeBadge prioridade="ALTA" />
          <Badge>Neutro</Badge>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['BURACO', 'LIXO', 'ILUMINACAO'].map((c) => (
            <Chip key={c} selecionado={chip === c} onClick={() => setChip(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </section>
      <section className="space-y-3 px-4">
        <h2 className="text-sm font-semibold text-text-muted">Cards e estados</h2>
        <GlassCard brilho>
          <p className="font-semibold">Card com brilho</p>
          <p className="text-sm text-text-muted">Conteúdo translúcido sobre o fundo.</p>
        </GlassCard>
        <ErrorBanner mensagem="Não foi possível conectar ao servidor." acao={<Button tamanho="sm" variante="fantasma">Tentar</Button>} />
        <GlassCard>
          <EmptyState icone={<Zap className="size-7" />} titulo="Nenhum chamado" descricao="Abra seu primeiro chamado pelo botão central." />
        </GlassCard>
        <div className="flex items-center gap-3">
          <Spinner /> <span className="text-sm text-text-muted">Carregando…</span>
        </div>
        <Button variante="secundaria" onClick={() => setSheet(true)}>
          Abrir bottom sheet
        </Button>
        <BottomSheet aberto={sheet} aoFechar={() => setSheet(false)} titulo="Confirmar este local">
          <p className="text-sm text-text-muted">Av. Afonso Pena, 1500 - Centro, Belo Horizonte</p>
          <Button larguraTotal className="mt-4" onClick={() => setSheet(false)}>
            Confirmar
          </Button>
        </BottomSheet>
      </section>
    </div>
  )
}
