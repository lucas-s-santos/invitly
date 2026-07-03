/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_NAME: string
  /** Link de checkout do produto na Kiwify (ex: https://pay.kiwify.com.br/xxxxx) */
  readonly VITE_KIWIFY_CHECKOUT_URL?: string
  /** Preço exibido no checkout (ex: "R$ 14,90") */
  readonly VITE_KIWIFY_PRICE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
