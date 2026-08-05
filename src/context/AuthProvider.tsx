import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"

import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { isAdminEmail } from "@/lib/admin"
import {
  clearVerifiedUserId,
  consumeOAuthPending,
  markOAuthPending,
  readVerifiedUserId,
  writeVerifiedUserId,
} from "@/lib/authSession"
import { AuthContext, type AuthContextValue } from "./auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  // Quem entrou de verdade nesta sessão do navegador (não só token restaurado)
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(() =>
    readVerifiedUserId(),
  )

  const markVerified = useCallback((userId: string) => {
    writeVerifiedUserId(userId)
    setVerifiedUserId(userId)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let active = true

    // Voltando do Google: o login foi explícito, então já vale como verificado.
    function apply(next: Session | null) {
      if (next?.user && consumeOAuthPending()) markVerified(next.user.id)
      setSession(next)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      apply(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      apply(nextSession)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [markVerified])

  const value = useMemo<AuthContextValue>(() => {
    const rawUser = session?.user ?? null
    // Conta de administrador exige login de verdade a cada sessão do navegador.
    // Sessão só restaurada do localStorage não abre o painel nem o /admin.
    const needsReauth = Boolean(
      rawUser &&
        isAdminEmail(rawUser.email) &&
        verifiedUserId !== rawUser.id,
    )

    return {
      session: needsReauth ? null : session,
      user: needsReauth ? null : rawUser,
      loading,
      pendingReauthEmail: needsReauth ? (rawUser?.email ?? null) : null,
      async signInWithPassword(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (!error && data.user) markVerified(data.user.id)
        return { error: error?.message ?? null }
      },
      async signUp(name, email, password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (!error && data.user) markVerified(data.user.id)
        return { error: error?.message ?? null }
      },
      async signInWithGoogle() {
        markOAuthPending()
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/dashboard` },
        })
        return { error: error?.message ?? null }
      },
      async signOut() {
        clearVerifiedUserId()
        setVerifiedUserId(null)
        await supabase.auth.signOut()
      },
    }
  }, [session, loading, verifiedUserId, markVerified])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
