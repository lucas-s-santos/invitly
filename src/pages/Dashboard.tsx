import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ClipboardList,
  Eye,
  LogOut,
  PartyPopper,
  Pencil,
  Plus,
  Users,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { useMyInvites } from "@/hooks/useInvites"
import { useMyRsvpSummary, type RsvpSummary } from "@/hooks/useRsvp"
import { getTemplate } from "@/lib/templates"
import { cn } from "@/lib/utils"
import type { Invite, InviteFields, InviteStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LanguageToggle } from "@/components/LanguageToggle"

const STATUS_META: Record<InviteStatus, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  paid: { label: "Pago", className: "bg-blue-100 text-blue-700" },
  published: { label: "Publicado", className: "bg-emerald-100 text-emerald-700" },
  expired: { label: "Expirado", className: "bg-red-100 text-red-700" },
}

const FILTERS: { id: "all" | InviteStatus; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "draft", label: "Rascunhos" },
  { id: "published", label: "Publicados" },
  { id: "expired", label: "Expirados" },
]

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { t } = useTranslation()
  const { data: invites, isLoading, isError } = useMyInvites()
  const { data: rsvpSummary } = useMyRsvpSummary()
  const [filter, setFilter] = useState<"all" | InviteStatus>("all")

  const displayName =
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    ""

  const filtered =
    invites?.filter((inv) => filter === "all" || inv.status === filter) ?? []

  return (
    <div className="min-h-svh bg-secondary/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="font-display text-xl font-extrabold">
            {t("brand")}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              <LogOut className="size-4" />
              {t("common.logout")}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">
              {t("nav.dashboard")}
            </h1>
            {displayName ? (
              <p className="mt-1 text-muted-foreground">Olá, {displayName} 👋</p>
            ) : null}
          </div>
          <Button asChild size="lg">
            <Link to="/editor/novo">
              <Plus className="size-4" />
              {t("nav.createCta")}
            </Link>
          </Button>
        </div>

        {/* Filtros */}
        {invites && invites.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === f.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}

        {/* Estados */}
        {isLoading ? (
          <p className="mt-10 text-center text-muted-foreground">
            {t("common.loading")}
          </p>
        ) : isError ? (
          <p className="mt-10 text-center text-destructive">
            Não foi possível carregar seus convites.
          </p>
        ) : !invites || invites.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((invite) => (
              <InviteCard
                key={invite.id}
                invite={invite}
                summary={rsvpSummary?.[invite.id]}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function InviteCard({
  invite,
  summary,
}: {
  invite: Invite
  summary?: RsvpSummary
}) {
  const template = getTemplate(invite.template_id)
  const fields = invite.data as InviteFields
  const status = STATUS_META[invite.status]
  const isPublished = invite.status === "published"
  const createdAt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(invite.created_at))

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div
        className="relative flex aspect-[16/10] flex-col items-center justify-center gap-1 px-4 text-center"
        style={{
          background: template?.style.background ?? "#1a0533",
          color: template?.style.textColor ?? "#fff",
        }}
      >
        <span className="text-3xl" aria-hidden>
          {template?.style.motif}
        </span>
        <span
          className="font-display text-base leading-tight font-bold"
          style={{
            fontFamily: template?.style.fontDisplay,
            color: template?.style.accentColor,
          }}
        >
          {fields.title}
        </span>
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold",
            status.className,
          )}
        >
          {status.label}
        </span>
      </div>
      <CardContent className="p-4">
        <p className="truncate font-semibold">{invite.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {invite.views}
          </span>
          {isPublished ? (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Users className="size-3" />
              {summary?.confirmed ?? 0} confirmados
            </span>
          ) : null}
          <span>{createdAt}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            asChild
            size="sm"
            variant={isPublished ? "outline" : "default"}
            className="flex-1"
          >
            <Link to={`/editor/${invite.id}`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
          {isPublished ? (
            <Button asChild size="sm" className="flex-1">
              <Link to={`/convite/${invite.slug}/lista`}>
                <ClipboardList className="size-4" />
                Confirmados
              </Link>
            </Button>
          ) : null}
          {isPublished ? (
            <Button asChild size="sm" variant="outline" aria-label="Ver convite">
              <a href={`/convite/${invite.slug}`} target="_blank" rel="noreferrer">
                <Eye className="size-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <Card className="mt-8 border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PartyPopper className="size-7" />
        </div>
        <div>
          <p className="font-semibold">Você ainda não criou convites</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece agora — criar e personalizar é grátis.
          </p>
        </div>
        <Button asChild>
          <Link to="/editor/novo">
            <Plus className="size-4" />
            {t("nav.createCta")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
