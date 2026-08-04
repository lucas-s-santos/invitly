import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  CalendarCheck,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  Search,
  Users,
  UserX,
} from "lucide-react"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

import { useInviteBySlugForOwner } from "@/hooks/useInvites"
import { useInviteRsvps } from "@/hooks/useRsvp"
import { useInviteViews } from "@/hooks/useAnalytics"
import { cn } from "@/lib/utils"
import {
  exportGuestsCsv,
  exportGuestsXlsx,
  printGuestList,
  sortForExport,
  type ExportOrder,
} from "@/lib/guestExport"
import type { Rsvp, RsvpStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

type Filter = RsvpStatus | "all"
type Sort = "recent" | "name" | "people"

export default function GuestList() {
  const { slug } = useParams()
  const { data: invite, isLoading } = useInviteBySlugForOwner(slug)
  const { data: rsvps, isLoading: loadingRsvps } = useInviteRsvps(invite?.id)
  const { data: viewsData } = useInviteViews(invite?.id)
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [sort, setSort] = useState<Sort>("recent")
  const [exportOpen, setExportOpen] = useState(false)
  const [order, setOrder] = useState<ExportOrder>("confirmation")

  const all = useMemo(() => rsvps ?? [], [rsvps])
  // o que a tela mostra e o que o CSV exporta — sempre em sincronia
  const visible = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = all.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false
      if (!term) return true
      return [r.name, r.email, r.phone, r.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    })
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "pt-BR")
      if (sort === "people") return b.guests_count - a.guests_count
      return b.created_at.localeCompare(a.created_at)
    })
  }, [all, q, filter, sort])

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

  const list = all
  const confirmed = list.filter((r) => r.status === "confirmed")
  const maybe = list.filter((r) => r.status === "maybe")
  const declined = list.filter((r) => r.status === "declined")
  const totalPeople = confirmed.reduce((sum, r) => sum + r.guests_count, 0)
  const conversion =
    invite.views > 0 ? Math.round((confirmed.length / invite.views) * 100) : 0
  const publicUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/convite/${invite.slug}`
  const lastRsvp = list.length
    ? list.reduce((a, b) => (a.created_at > b.created_at ? a : b))
    : null

  /** Exporta o que está na tela, na ordem escolhida, no formato escolhido. */
  async function runExport(format: "xlsx" | "csv" | "print") {
    if (!invite) return
    const info = {
      title: invite.title,
      slug: invite.slug,
      eventDate: (invite.data as { event_date?: string })?.event_date,
    }
    const rows = sortForExport(visible, order)
    setExportOpen(false)
    if (format === "print") {
      if (!printGuestList(info, rows)) {
        toast.error("O navegador bloqueou a janela. Libere os pop-ups e tente.")
      }
      return
    }
    try {
      if (format === "xlsx") await exportGuestsXlsx(info, rows)
      else exportGuestsCsv(info, rows)
      toast.success(
        `${rows.length} ${rows.length === 1 ? "linha exportada" : "linhas exportadas"}.`,
      )
    } catch {
      toast.error("Não foi possível gerar o arquivo.")
    }
  }

  /** Copia os nomes visíveis (útil pra colar num grupo ou na portaria). */
  async function copyNames() {
    const text = visible
      .map((r) =>
        r.guests_count > 1 ? `${r.name} (${r.guests_count})` : r.name,
      )
      .join("\n")
    await navigator.clipboard.writeText(text)
    toast.success("Lista de nomes copiada!")
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
              <>
                <Button variant="outline" size="sm" onClick={() => void copyNames()}>
                  <Copy className="size-4" />
                  <span className="hidden sm:inline">Copiar nomes</span>
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExportOpen((v) => !v)}
                  >
                    <Download className="size-4" />
                    <span className="hidden sm:inline">Exportar</span>
                    <ChevronDown className="size-3.5" />
                  </Button>
                  {exportOpen ? (
                    <ExportMenu
                      count={visible.length}
                      order={order}
                      onOrder={setOrder}
                      onPick={(f) => void runExport(f)}
                      onClose={() => setExportOpen(false)}
                    />
                  ) : null}
                </div>
              </>
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

        {/* Proporção das respostas + última confirmação */}
        {list.length > 0 ? (
          <div className="mt-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <Slice n={confirmed.length} total={list.length} className="bg-emerald-500" />
              <Slice n={maybe.length} total={list.length} className="bg-amber-400" />
              <Slice n={declined.length} total={list.length} className="bg-muted-foreground/40" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <Legend className="bg-emerald-500" label={`${confirmed.length} confirmados`} />
              <Legend className="bg-amber-400" label={`${maybe.length} talvez`} />
              <Legend className="bg-muted-foreground/40" label={`${declined.length} não vão`} />
              {lastRsvp ? (
                <span className="ml-auto">
                  Última resposta: {relativeTime(lastRsvp.created_at)}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

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

        {/* Busca + filtros */}
        {list.length > 0 ? (
          <div className="mt-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nome, e-mail, telefone ou recado"
                  className="bg-card pl-9"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-9 rounded-md border border-border bg-card px-2 text-sm"
                aria-label="Ordenar lista"
              >
                <option value="recent">Mais recentes</option>
                <option value="name">Nome (A–Z)</option>
                <option value="people">Mais pessoas</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { v: "all", label: `Todos (${list.length})` },
                  { v: "confirmed", label: `🎉 Confirmados (${confirmed.length})` },
                  { v: "maybe", label: `🤔 Talvez (${maybe.length})` },
                  { v: "declined", label: `😔 Não vão (${declined.length})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.v}
                  type="button"
                  onClick={() => setFilter(f.v as Filter)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    filter === f.v
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Lista */}
        <div className="mt-4">
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
          ) : visible.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Ninguém encontrado com esse filtro.
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {visible.map((rsvp) => (
                  <GuestRow key={rsvp.id} rsvp={rsvp} />
                ))}
              </ul>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {visible.length} de {list.length} respostas · o CSV e a cópia de
                nomes seguem o filtro atual
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

/** Menu de exportação: escolhe a ordem e o formato. */
function ExportMenu({
  count,
  order,
  onOrder,
  onPick,
  onClose,
}: {
  count: number
  order: ExportOrder
  onOrder: (o: ExportOrder) => void
  onPick: (f: "xlsx" | "csv" | "print") => void
  onClose: () => void
}) {
  const formats = [
    {
      id: "xlsx" as const,
      icon: <FileSpreadsheet className="size-4 text-emerald-600" />,
      label: "Excel (.xlsx)",
      hint: "Formatado, com cores e colunas prontas",
    },
    {
      id: "csv" as const,
      icon: <FileText className="size-4 text-muted-foreground" />,
      label: "CSV",
      hint: "Abre em qualquer planilha",
    },
    {
      id: "print" as const,
      icon: <Printer className="size-4 text-muted-foreground" />,
      label: "Imprimir / PDF",
      hint: "Folha pronta pra levar no dia",
    },
  ]

  return (
    <>
      {/* clique fora fecha */}
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden />
      <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-border bg-card p-3 text-left shadow-xl">
        <p className="text-xs font-medium text-muted-foreground">Ordem</p>
        <div className="mt-1.5 inline-flex w-full rounded-lg border border-border p-0.5 text-xs font-medium">
          {(
            [
              { v: "confirmation", label: "Confirmação" },
              { v: "alpha", label: "Alfabética" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => onOrder(o.v)}
              className={cn(
                "flex-1 rounded-md px-2 py-1 transition-colors",
                order === o.v
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs font-medium text-muted-foreground">Formato</p>
        <div className="mt-1.5 space-y-1">
          {formats.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onPick(f.id)}
              className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-secondary"
            >
              <span className="mt-0.5">{f.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{f.label}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {f.hint}
                </span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
          {count} {count === 1 ? "resposta" : "respostas"} — segue a busca e o
          filtro da tela.
        </p>
      </div>
    </>
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
          {rsvp.email || rsvp.phone ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {rsvp.phone ? (
                <a
                  href={`https://wa.me/${waNumber(rsvp.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  <Phone className="size-3" />
                  {rsvp.phone}
                </a>
              ) : null}
              {rsvp.email ? (
                <a
                  href={`mailto:${rsvp.email}`}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  <Mail className="size-3" />
                  {rsvp.email}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{date}</span>
      </div>
    </li>
  )
}

/** Telefone só com dígitos + DDI 55 (o WhatsApp exige o país). */
function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("55") ? digits : `55${digits}`
}

/** Pedaço colorido da barra de proporção das respostas. */
function Slice({
  n,
  total,
  className,
}: {
  n: number
  total: number
  className: string
}) {
  if (n === 0) return null
  return <div className={className} style={{ width: `${(n / total) * 100}%` }} />
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", className)} />
      {label}
    </span>
  )
}

/** "há 2 h", "ontem", "há 5 dias" — dá a sensação de movimento da lista. */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return "agora"
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.round(h / 24)
  if (d === 1) return "ontem"
  if (d < 30) return `há ${d} dias`
  return new Date(iso).toLocaleDateString("pt-BR")
}
