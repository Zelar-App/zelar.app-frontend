import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <Link to="/" className="rounded-full bg-primary px-5 py-2 font-medium text-bg shadow-glow">
        Voltar ao início
      </Link>
    </section>
  )
}
