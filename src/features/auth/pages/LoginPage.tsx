import { LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { mensagemDeErro } from '../../../services/api'
import { Button, ErrorBanner, Input } from '../../../shared/ui'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../useAuth'
import { semErros, validarLogin, type Erros } from '../validacao'
import type { LoginInput } from '../../../domain/types'

export default function LoginPage() {
  const { usuario, carregando: restaurando, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { de?: string } | null)?.de ?? '/'

  const [form, setForm] = useState<LoginInput>({ email: '', senha: '' })
  const [erros, setErros] = useState<Erros<LoginInput>>({})
  const [erroApi, setErroApi] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (!restaurando && usuario) return <Navigate to={destino} replace />

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    const v = validarLogin(form)
    setErros(v)
    setErroApi(null)
    if (!semErros(v)) return
    setEnviando(true)
    try {
      await login(form)
      navigate(destino, { replace: true })
    } catch (err) {
      setErroApi(mensagemDeErro(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Entrar"
      subtitulo="Acesse para acompanhar seus chamados."
      rodape={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-primary">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-4">
        <Input
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@exemplo.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          erro={erros.email}
        />
        <Input
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })}
          erro={erros.senha}
        />
        {erroApi && <ErrorBanner mensagem={erroApi} />}
        <Button type="submit" larguraTotal carregando={enviando} icone={<LogIn className="size-5" aria-hidden="true" />}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
