import { createContext } from "react"
import type { Session, User } from "@supabase/supabase-js"

export interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
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
