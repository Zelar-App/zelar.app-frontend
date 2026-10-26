import { defineConfig } from 'vite'
import { loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const plugins: PluginOption[] = [react()]

  // VITE_HTTPS=true liga HTTPS local (certificado autoassinado) para testar GPS e câmera
  // num celular na mesma rede: https://<ip-do-pc>:5173
  if (env.VITE_HTTPS === 'true') {
    const { default: basicSsl } = await import('@vitejs/plugin-basic-ssl')
    plugins.push(basicSsl())
  }

  return {
    plugins,
    server: { host: env.VITE_HTTPS === 'true' },
  }
})
