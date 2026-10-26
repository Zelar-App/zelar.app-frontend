import { UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import type { CadastroInput } from '../../../domain/types'
import { mensagemDeErro } from '../../../services/api'
import { Button, ErrorBanner, Input } from '../../../shared/ui'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../useAuth'
import { REGRAS, semErros, validarCadastro, type Erros } from '../validacao'

export default function CadastroPage() {
  const { usuario, carregando: restaurando, cadastrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<CadastroInput>({ nome: '', email: '', senha: '', telefone: '' })
  const [erros, setErros] = useState<Erros<CadastroInput>>({})
  const [erroApi, setErroApi] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (!restaurando && usuario) return <Navigate to="/" replace />

  const campo = (k: keyof CadastroInput) => ({
    value: form[k] ?? '',
    onChange: (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value }),
    erro: erros[k],
  })

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    const v = validarCadastro(form)
    setErros(v)
    setErroApi(null)
    if (!semErros(v)) return
    setEnviando(true)
    try {
      await cadastrar({ ...form, telefone: form.telefone?.trim() || undefined })
      navigate('/', { replace: true })
    } catch (err) {
      setErroApi(mensagemDeErro(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Criar conta"
      subtitulo="Leva menos de um minuto."
      rodape={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-4">
        <Input rotulo="Nome completo" autoComplete="name" maxLength={REGRAS.nomeMax} placeholder="Como quer ser chamado(a)" {...campo('nome')} />
        <Input rotulo="E-mail" type="email" autoComplete="email" inputMode="email" maxLength={REGRAS.emailMax} placeholder="voce@exemplo.com" {...campo('email')} />
        <Input
          rotulo="Senha"
          type="password"
          autoComplete="new-password"
          maxLength={REGRAS.senhaMax}
          placeholder="Mínimo de 8 caracteres"
          dica="Entre 8 e 72 caracteres."
          {...campo('senha')}
        />
        <Input rotulo="Telefone (opcional)" type="tel" autoComplete="tel" inputMode="tel" maxLength={REGRAS.telefoneMax} placeholder="(31) 99999-0000" {...campo('telefone')} />
        {erroApi && <ErrorBanner mensagem={erroApi} />}
        <Button type="submit" larguraTotal carregando={enviando} icone={<UserPlus className="size-5" aria-hidden="true" />}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  )
}
