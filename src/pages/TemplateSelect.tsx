import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Crown, Loader2 } from "lucide-react"

import { CATEGORIES } from "@/lib/categories"
import { TEMPLATES } from "@/lib/templates"
import { useCreateInvite } from "@/hooks/useInvites"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TemplatePreview } from "@/components/invite/TemplatePreview"

export default function TemplateSelect() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createInvite = useCreateInvite()
  const [category, setCategory] = useState<string>("all")
  const [pendingId, setPendingId] = useState<string | null>(null)

  const templates =
    category === "all"
      ? TEMPLATES
      : TEMPLATES.filter((tpl) => tpl.category === category)

  function handlePick(templateId: string, cat: string) {
    setPendingId(templateId)
    createInvite.mutate(
      { templateId, category: cat },
      {
        onSuccess: (invite) => navigate(`/editor/${invite.id}`),
        onError: () => setPendingId(null),
      },
    )
  }

  return (
    <div className="min-h-svh bg-secondary/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="size-4" />
              {t("nav.dashboard")}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold">
          {t("templates.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("templates.subtitle")}</p>

        {/* Filtro de categorias */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Chip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="Todos"
          />
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              active={category === cat.id}
              onClick={() => setCategory(cat.id)}
              label={`${cat.emoji} ${t(cat.labelKey)}`}
            />
          ))}
        </div>

        {createInvite.isError ? (
          <p className="mt-4 text-sm text-destructive">
            Não foi possível criar o convite. Tente novamente.
          </p>
        ) : null}

        {/* Grade de templates */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {templates.map((tpl) => {
            const isPending = pendingId === tpl.id
            return (
              <button
                key={tpl.id}
                type="button"
                disabled={createInvite.isPending}
                onClick={() => handlePick(tpl.id, tpl.category)}
                className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-transform hover:-translate-y-1 disabled:opacity-60"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <TemplatePreview
                    template={tpl}
                    className="absolute inset-0 h-full w-full"
                  />
                  {isPending ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Loader2 className="size-6 animate-spin text-white" />
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="truncate text-sm font-semibold">
                    {tpl.name}
                  </span>
                  {tpl.isPremium ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                      <Crown className="size-3" />
                      {t("templates.premium")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {t("templates.free")}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}
