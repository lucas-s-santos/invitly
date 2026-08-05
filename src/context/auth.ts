import { createContext } from "react"
import type { Session, User } from "@supabase/supabase-js"

export interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  /**
   * E-mail da conta de administrador cuja sessão foi restaurada do navegador
   * sem login de verdade nesta sessão. Enquanto isso, `user` e `session` ficam
   * nulos: o painel só abre depois de digitar e-mail e senha outra vez.
   */
  pendingReauthEmail: string | null
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
