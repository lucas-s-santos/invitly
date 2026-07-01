import type { ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarCheck,
  Download,
  ExternalLink,
  HelpCircle,
  MessageCircle,
  Users,
  UserX,
} from "lucide-react"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

import { useInviteBySlugForOwner } from "@/hooks/useInvites"
import { useInviteRsvps } from "@/hooks/useRsvp"
import { useInviteViews } from "@/hooks/useAnalytics"
import { cn } from "@/lib/utils"
import type { Rsvp, RsvpStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import { PagePlaceholder } from "@/components/PagePlaceholder"

const STATUS_META: Record<
  RsvpStatus,
  { label: string; className: string; emoji: string }
> = {
  confirmed: { label: "Confirmado", className: "bg-emerald-100 text-emerald-700", emoji: "🎉" },
  maybe: { label: "Talvez", className: "bg-amber-100 text-amber-700", emoji: "🤔" },
  declined: { label: "Não vai", className: "bg-muted text-muted-foreground", emoji: "😔" },
}

export default function GuestList() {
  const { slug } = useParams()
  const { data: invite, isLoading } = useInviteBySlugForOwner(slug)
  const { data: rsvps, isLoading: loadingRsvps } = useInviteRsvps(invite?.id)
  const { data: viewsData } = useInviteViews(invite?.id)

  if (isLoading) return <FullScreenLoader />
  if (!invite) {
    return (
      <PagePlaceholder
        title="Lista indisponível"
        description="Este convite não existe ou você não é o dono dele."
        backTo="/dashboard"
        backLabel="Voltar ao painel"
      />
    )
  }

  const list = rsvps ?? []
  const confirmed = list.filter((r) => r.status === "confirmed")
  const maybe = list.filter((r) => r.status === "maybe")
  const declined = list.filter((r) => r.status === "declined")
  const totalPeople = confirmed.reduce((sum, r) => sum + r.guests_count, 0)
  const conversion =
    invite.views > 0 ? Math.round((confirmed.length / invite.views) * 100) : 0
  const publicUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/convite/${invite.slug}`

  function downloadCsv() {
    if (!invite) return
    const head = [
      "Nome",
      "Status",
      "Pessoas",
      "Email",
      "Telefone",
      "Recado",
      "Data",
    ]
    const esc = (v: string | number | null | undefined) =>
      `"${String(v ?? "").replace(/"/g, '""')}"`
    const rows = list.map((r) =>
      [
        r.name,
        STATUS_META[r.status].label,
        r.guests_count,
        r.email,
        r.phone,
        r.message,
        new Date(r.created_at).toLocaleString("pt-BR"),
      ]
        .map(esc)
        .join(","),
    )
    const csv = "﻿" + [head.map(esc).join(","), ...rows].join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `confirmados-${invite.slug}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-svh bg-secondary/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="size-4" />
              {"Painel"}
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {list.length > 0 ? (
              <Button variant="outline" size="sm" onClick={downloadCsv}>
                <Download className="size-4" />
                <span className="hidden sm:inline">CSV</span>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                <span className="hidden sm:inline">Ver convite</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <p className="text-sm text-muted-foreground">Confirmações de</p>
        <h1 className="font-display text-3xl font-bold">{invite.title}</h1>

        {/* Resumo */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={<Users className="size-5" />} value={totalPeople} label="Pessoas confirmadas" highlight />
          <Stat icon={<CalendarCheck className="size-5" />} value={confirmed.length} label="Confirmações" />
          <Stat icon={<HelpCircle className="size-5" />} value={maybe.length} label="Talvez" />
          <Stat icon={<UserX className="size-5" />} value={declined.length} label="Não vão" />
        </div>

        {/* Analytics de visualizações */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">Visualizações (7 dias)</p>
            <span className="text-sm text-muted-foreground">
              {invite.views} no total · {conversion}% de conversão
            </span>
          </div>
          <div className="mt-4 h-40">
            {viewsData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsData}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip cursor={{ fill: "rgba(255,107,157,0.08)" }} />
                  <Bar dataKey="views" fill="#ff6b9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Lista */}
        <div className="mt-8">
          {loadingRsvps ? (
            <p className="py-10 text-center text-muted-foreground">Carregando...</p>
          ) : list.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="size-6" />
                </div>
                <p className="font-semibold">Ninguém confirmou ainda</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Compartilhe o link do convite para começar a receber confirmações.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-1">
                  <a href={publicUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Abrir convite
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-2">
              {list.map((rsvp) => (
                <GuestRow key={rsvp.id} rsvp={rsvp} />
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
  highlight,
}: {
  icon: ReactNode
  value: number
  label: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        highlight
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card",
      )}
    >
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          highlight ? "bg-primary/15 text-primary" : "bg-secondary text-foreground",
        )}
      >
        {icon}
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function GuestRow({ rsvp }: { rsvp: Rsvp }) {
  const meta = STATUS_META[rsvp.status]
  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(rsvp.created_at))

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-lg font-bold">
          {rsvp.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{rsvp.name}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-bold",
                meta.className,
              )}
            >
              {meta.emoji} {meta.label}
            </span>
            {rsvp.status === "confirmed" && rsvp.guests_count > 1 ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3" />
                {rsvp.guests_count} pessoas
              </span>
            ) : null}
          </div>
          {rsvp.message ? (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="mt-0.5 size-3.5 shrink-0" />
              <span className="italic">"{rsvp.message}"</span>
            </p>
          ) : null}
          {rsvp.email ? (
            <p className="mt-1 text-xs text-muted-foreground">{rsvp.email}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{date}</span>
      </div>
    </li>
  )
}
