import { defineConfig } from 'vitest/config'
import { loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const plugins: PluginOption[] = [react(), tailwindcss()]

  // VITE_HTTPS=true liga HTTPS local (certificado autoassinado) para testar GPS e câmera
  // num celular na mesma rede: https://<ip-do-pc>:5173
  if (env.VITE_HTTPS === 'true') {
    const { default: basicSsl } = await import('@vitejs/plugin-basic-ssl')
    plugins.push(basicSsl())
  }

  return {
    plugins,
    server: {
      host: env.VITE_HTTPS === 'true',
      proxy: env.VITE_API_MODE === 'http' ? {
        '/api': { target: env.API_PROXY_TARGET || 'http://localhost:8080', changeOrigin: true },
      } : undefined,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['src/test/setup.ts'],
      css: false,
      coverage: {
        provider: 'v8' as const,
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}', 'src/test/**', 'src/**/*.d.ts',
          // Entrada sem regra própria e módulos apenas de tipos/reexports.
          'src/main.tsx', 'src/domain/types.ts', 'src/services/api/contracts.ts', 'src/shared/ui/index.ts',
        ],
        reporter: ['text', 'html', 'json', 'json-summary'] as ('text' | 'html' | 'json' | 'json-summary')[],
        thresholds: {
          perFile: true,
          lines: 90,
          branches: 90,
          functions: 90,
          statements: 90,
        },
      },
    },
  }
})
