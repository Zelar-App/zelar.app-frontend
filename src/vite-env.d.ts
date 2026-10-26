/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_MAP_CENTER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
