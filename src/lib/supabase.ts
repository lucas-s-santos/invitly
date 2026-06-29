import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** true quando as variáveis do Supabase estão presentes no .env */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    "[Invitly] Supabase não configurado. Defina VITE_SUPABASE_URL e " +
      "VITE_SUPABASE_ANON_KEY em .env para habilitar auth e banco de dados.",
  )
}

// Usamos placeholders quando não configurado para que o app continue
// inicializando localmente (a UI mostra um aviso e desabilita ações de auth).
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
