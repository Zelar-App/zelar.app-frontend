import type { ReactNode } from 'react'
import { GlassCard } from '../../../shared/ui'

/** Tela cheia centrada com a marca e um card glass para o formulário. */
export function AuthLayout({ titulo, subtitulo, children, rodape }: { titulo: string; subtitulo: string; children: ReactNode; rodape: ReactNode }) {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#354740] px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-3/5 bg-[radial-gradient(circle_at_top,_#52675e_0%,_transparent_68%)] opacity-70"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-[radial-gradient(circle_at_bottom_right,_#285c3d_0%,_transparent_72%)] opacity-35"
        aria-hidden="true"
      />
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img src="/assets/logo-zelar.png" alt="Zelar App" className="h-auto w-full max-w-xs sm:max-w-sm" />
         <p className="relative -top-7 left-9 text-sm font-bold text-white">Conectando pessoas, dados e cidades.</p>
        </div>
        <GlassCard brilho className="bg-bg-elevated/90 p-6">
          <h2 className="text-xl font-semibold">{titulo}</h2>
          <p className="-mt-1 mb-5 text-sm text-text-muted">{subtitulo}</p>
          {children}
        </GlassCard>
        <p className="mt-6 text-center text-sm text-text-muted">{rodape}</p>
      </div>
    </main>
  )
}
