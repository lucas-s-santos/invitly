import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslation } from "react-i18next"
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { isSupabaseConfigured } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LanguageToggle } from "@/components/LanguageToggle"

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6),
})

type FormValues = z.infer<typeof formSchema>

type Mode = "login" | "signup"

export default function Login() {
  const { t } = useTranslation()
  const { user, signInWithPassword, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard"

  const [mode, setMode] = useState<Mode>("login")
  const [serverError, setServerError] = useState<string | null>(null)
  const [signupDone, setSignupDone] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    if (mode === "login") {
      const { error } = await signInWithPassword(values.email, values.password)
      if (error) setServerError(error)
      else navigate(from, { replace: true })
    } else {
      const name = values.name?.trim() ?? ""
      if (name.length < 2) {
        setError("name", { message: "Informe seu nome" })
        return
      }
      const { error } = await signUp(name, values.email, values.password)
      if (error) setServerError(error)
      else setSignupDone(true)
    }
  })

  const isLogin = mode === "login"

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Painel de marca (desktop) */}
      <aside className="bg-brand-aurora relative hidden flex-col justify-between p-12 text-white lg:flex">
        <Link to="/" className="font-display text-2xl font-extrabold">
          {t("brand")}
        </Link>
        <div>
          <h2 className="font-display text-4xl leading-tight font-bold">
            {t("hero.title")}
          </h2>
          <p className="mt-4 max-w-md text-white/70">{t("hero.subtitle")}</p>
        </div>
        <p className="text-sm text-white/50">
          © {new Date().getFullYear()} {t("brand")}
        </p>
      </aside>

      {/* Formulário */}
      <main className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="lg:invisible">
            <Link to="/">
              <ArrowLeft className="size-4" />
              {t("brand")}
            </Link>
          </Button>
          <LanguageToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-3xl font-bold">
            {isLogin ? t("auth.loginTitle") : t("auth.signupTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin ? t("auth.loginSubtitle") : t("auth.signupSubtitle")}
          </p>

          {/* Tabs entrar / cadastrar */}
          <div className="mt-6 inline-flex rounded-lg border border-border bg-secondary p-1 text-sm font-medium">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m)
                  setServerError(null)
                  setSignupDone(false)
                }}
                className={
                  "flex-1 rounded-md px-4 py-1.5 transition-colors " +
                  (mode === m
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {m === "login" ? t("auth.tabLogin") : t("auth.tabSignup")}
              </button>
            ))}
          </div>

          {!isSupabaseConfigured ? (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{t("auth.notConfigured")}</span>
            </div>
          ) : null}

          {signupDone ? (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>{t("auth.signupSuccess")}</span>
            </div>
          ) : null}

          {serverError ? (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {!isLogin ? (
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder={t("auth.namePlaceholder")}
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder={t("auth.passwordPlaceholder")}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !isSupabaseConfigured}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isLogin ? t("auth.submitLogin") : t("auth.submitSignup")}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("auth.or")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={!isSupabaseConfigured}
            onClick={() => void signInWithGoogle()}
          >
            <GoogleIcon />
            {t("auth.googleButton")}
          </Button>
        </div>
      </main>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}
