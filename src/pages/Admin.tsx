import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Link, Navigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  BarChart3,
  Crown,
  Eye,
  ExternalLink,
  FileText,
  Heart,
  Loader2,
  Rocket,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Undo2,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useAuth } from "@/hooks/useAuth"
import { isAdminEmail } from "@/lib/admin"
import { CATEGORIES } from "@/lib/categories"
import { BASIC_PRICE, PREMIUM_PRICE } from "@/lib/plans"
import {
  useAdminAddAdmin,
  useAdminAdmins,
  useAdminDeleteInvite,
  useAdminInvites,
  useAdminRemoveAdmin,
  useAdminSetStatus,
  useAdminStats,
  useAdminUsers,
} from "@/hooks/useAdmin"
import type { InviteStatus } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Tab = "stats" | "invites" | "users" | "admins"

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "stats", label: "Métricas", icon: BarChart3 },
  { id: "invites", label: "Convites", icon: FileText },
  { id: "users", label: "Usuários", icon: Users },
  { id: "admins", label: "Admins", icon: ShieldCheck },
]

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>("stats")

  if (!isAdminEmail(user?.email)) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-svh bg-secondary/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="size-4" />
              Painel
            </Link>
          </Button>
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <ShieldCheck className="size-4 text-primary" />
            Administração
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors " +
                (tab === t.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "stats" ? <StatsTab /> : null}
        {tab === "invites" ? <InvitesTab /> : null}
        {tab === "users" ? <UsersTab /> : null}
        {tab === "admins" ? <AdminsTab /> : null}
      </main>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex justify-center py-16 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  )
}

function ErrorBox({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      {message || "Não foi possível carregar. Você rodou a migration 0004?"}
    </div>
  )
}

/** Extrai o número de "R$ 12,90" → 12.90 (p/ estimar a receita). */
function priceValue(label: string): number {
  const n = label.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
  const v = Number.parseFloat(n)
  return Number.isFinite(v) ? v : 0
}

const STATUS_LABEL: Record<string, string> = {
  published: "Publicados",
  draft: "Rascunhos",
  paid: "Pagos",
  expired: "Expirados",
}

function StatsTab() {
  const { t } = useTranslation()
  const { data, isLoading, isError, error } = useAdminStats()

  if (isLoading) return <Loading />
  if (isError || !data) return <ErrorBox message={(error as Error)?.message} />

  const catLabel = (id: string) => {
    const c = CATEGORIES.find((x) => x.id === id)
    return c ? `${c.emoji} ${t(c.labelKey)}` : id
  }

  const premium = data.premium ?? 0
  const basico = data.basico ?? 0
  const revenue =
    basico * priceValue(BASIC_PRICE) + premium * priceValue(PREMIUM_PRICE)
  // conversão: quantos dos convites criados chegaram a ser publicados
  const conversion =
    data.invites > 0 ? Math.round((data.published / data.invites) * 100) : 0

  const cards = [
    {
      label: "Receita estimada",
      value: revenue.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      hint: `${basico} básico · ${premium} premium`,
      icon: <Wallet className="size-4" />,
      highlight: true,
    },
    {
      label: "Convites",
      value: data.invites,
      hint: delta(data.invites_7d),
      icon: <FileText className="size-4" />,
    },
    {
      label: "Publicados",
      value: data.published,
      hint: `${conversion}% dos criados`,
      icon: <Rocket className="size-4" />,
    },
    {
      label: "Confirmações",
      value: data.rsvps,
      hint:
        data.guests != null
          ? `${data.guests} pessoas no total`
          : delta(data.rsvps_7d),
      icon: <Heart className="size-4" />,
    },
    {
      label: "Visualizações",
      value: data.views,
      hint: delta(data.views_7d),
      icon: <Eye className="size-4" />,
    },
    {
      label: "Usuários",
      value: data.users,
      hint: delta(data.users_7d),
      icon: <Users className="size-4" />,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={cn(
              "rounded-xl border p-4",
              c.highlight
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card",
            )}
          >
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              {c.icon}
              {c.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              {c.value}
            </p>
            {c.hint ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {c.hint}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {data.series?.length ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-1.5 font-semibold">
            <TrendingUp className="size-4 text-primary" />
            Últimos 14 dias
          </p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.series}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip cursor={{ fill: "rgba(255,107,157,0.08)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar name="Convites" dataKey="invites" fill="#ff6b9d" radius={[4, 4, 0, 0]} />
                <Bar name="Confirmações" dataKey="rsvps" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar name="Views" dataKey="views" fill="#facc15" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Rode a migration <strong>0005_admin_metrics.sql</strong> no Supabase
          para liberar gráficos, planos, categorias e os dados de 7 dias.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {data.by_status?.length ? (
          <Panel title="Convites por status">
            <BarList
              items={data.by_status.map((s) => ({
                label: STATUS_LABEL[s.status] ?? s.status,
                n: s.n,
              }))}
            />
          </Panel>
        ) : null}

        {data.by_category?.length ? (
          <Panel title="Ocasiões mais criadas">
            <BarList
              items={data.by_category.map((c) => ({
                label: catLabel(c.category),
                n: c.n,
              }))}
            />
          </Panel>
        ) : null}
      </div>

      {data.top?.length ? (
        <Panel title="Convites mais vistos">
          <ul className="space-y-1.5">
            {data.top.map((inv) => (
              <li
                key={inv.slug}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <a
                  href={`/convite/${inv.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate font-medium hover:text-primary hover:underline"
                >
                  {inv.title}
                </a>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {inv.views} views · {inv.rsvps} confirmações
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  )
}

/** "+3 nos últimos 7 dias" (ou nada, se a migration 0005 não rodou). */
function delta(n?: number): string {
  if (n == null) return ""
  return n > 0 ? `+${n} em 7 dias` : "nenhum em 7 dias"
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-3 font-semibold">{title}</p>
      {children}
    </div>
  )
}

/** Lista com barrinha proporcional — leitura rápida das distribuições. */
function BarList({ items }: { items: { label: string; n: number }[] }) {
  const max = Math.max(...items.map((i) => i.n), 1)
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate">{i.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {i.n}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(i.n / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function StatusBadge({ status }: { status: InviteStatus }) {
  const map: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-800",
    draft: "bg-amber-100 text-amber-800",
    paid: "bg-blue-100 text-blue-800",
    expired: "bg-neutral-200 text-neutral-700",
  }
  return (
    <span
      className={
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium " +
        (map[status] || "bg-neutral-200 text-neutral-700")
      }
    >
      {status}
    </span>
  )
}

type InviteSort = "recent" | "views" | "rsvps"

function InvitesTab() {
  const { data, isLoading, isError, error } = useAdminInvites()
  const setStatus = useAdminSetStatus()
  const del = useAdminDeleteInvite()
  const [q, setQ] = useState("")
  const [status, setStatusFilter] = useState<InviteStatus | "all">("all")
  const [sort, setSort] = useState<InviteSort>("recent")

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = (data ?? []).filter((inv) => {
      if (status !== "all" && inv.status !== status) return false
      if (!term) return true
      return (
        inv.title.toLowerCase().includes(term) ||
        inv.slug.toLowerCase().includes(term) ||
        (inv.owner_email ?? "").toLowerCase().includes(term)
      )
    })
    return [...list].sort((a, b) => {
      if (sort === "views") return b.views - a.views
      if (sort === "rsvps") return (b.rsvps ?? 0) - (a.rsvps ?? 0)
      return b.created_at.localeCompare(a.created_at)
    })
  }, [data, q, status, sort])

  if (isLoading) return <Loading />
  if (isError || !data) return <ErrorBox message={(error as Error)?.message} />
  if (data.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhum convite ainda.</p>

  const counts = data.reduce<Record<string, number>>((acc, inv) => {
    acc[inv.status] = (acc[inv.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, link ou e-mail do dono"
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as InviteSort)}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          aria-label="Ordenar convites"
        >
          <option value="recent">Mais recentes</option>
          <option value="views">Mais vistos</option>
          <option value="rsvps">Mais confirmações</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { v: "all", label: `Todos (${data.length})` },
            { v: "published", label: `Publicados (${counts.published ?? 0})` },
            { v: "draft", label: `Rascunhos (${counts.draft ?? 0})` },
            { v: "paid", label: `Pagos (${counts.paid ?? 0})` },
            { v: "expired", label: `Expirados (${counts.expired ?? 0})` },
          ] as const
        ).map((f) => (
          <button
            key={f.v}
            type="button"
            onClick={() => setStatusFilter(f.v as InviteStatus | "all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              status === f.v
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum convite com esse filtro.
        </p>
      ) : (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-muted-foreground">
          <tr>
            <th className="p-3">Convite</th>
            <th className="p-3">Dono</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Views</th>
            <th className="p-3 text-right">RSVP</th>
            <th className="p-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((inv) => (
            <tr key={inv.id} className="border-b border-border/60 last:border-0">
              <td className="max-w-[220px] p-3">
                <p className="flex items-center gap-1.5 truncate font-medium">
                  {inv.title}
                  {inv.plan === "premium" ? (
                    <Crown className="size-3.5 shrink-0 text-amber-500" />
                  ) : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(inv.created_at).toLocaleDateString("pt-BR")}
                  {inv.category ? ` · ${inv.category}` : ""}
                </p>
              </td>
              <td className="max-w-[160px] p-3">
                <span className="truncate text-xs text-muted-foreground">
                  {inv.owner_email || "—"}
                </span>
              </td>
              <td className="p-3">
                <StatusBadge status={inv.status} />
              </td>
              <td className="p-3 text-right tabular-nums">{inv.views}</td>
              <td className="p-3 text-right tabular-nums text-muted-foreground">
                {inv.rsvps ?? "—"}
              </td>
              <td className="p-3">
                <div className="flex justify-end gap-1">
                  {inv.status === "published" ? (
                    <a
                      href={`/convite/${inv.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
                      title="Ver convite"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  ) : null}
                  {inv.status === "published" ? (
                    <button
                      type="button"
                      title="Despublicar"
                      onClick={() =>
                        setStatus.mutate(
                          { id: inv.id, status: "draft" },
                          { onSuccess: () => toast.success("Despublicado.") },
                        )
                      }
                      className="rounded-md p-1.5 text-amber-700 hover:bg-amber-50"
                    >
                      <Undo2 className="size-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Publicar"
                      onClick={() =>
                        setStatus.mutate(
                          { id: inv.id, status: "published" },
                          { onSuccess: () => toast.success("Publicado.") },
                        )
                      }
                      className="rounded-md p-1.5 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Rocket className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Excluir"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Excluir o convite "${inv.title}"? Isso apaga também as confirmações.`,
                        )
                      )
                        del.mutate(inv.id, {
                          onSuccess: () => toast.success("Convite excluído."),
                        })
                    }}
                    className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      )}
      <p className="text-xs text-muted-foreground">
        {rows.length} de {data.length} convites
      </p>
    </div>
  )
}

function UsersTab() {
  const { data, isLoading, isError, error } = useAdminUsers()
  const [q, setQ] = useState("")
  const [sort, setSort] = useState<"recent" | "invites">("recent")

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = (data ?? []).filter((u) =>
      term ? (u.email ?? "").toLowerCase().includes(term) : true,
    )
    return [...list].sort((a, b) =>
      sort === "invites"
        ? b.invites - a.invites
        : b.created_at.localeCompare(a.created_at),
    )
  }, [data, q, sort])

  if (isLoading) return <Loading />
  if (isError || !data) return <ErrorBox message={(error as Error)?.message} />
  if (data.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhum usuário ainda.</p>

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por e-mail"
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "recent" | "invites")}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          aria-label="Ordenar usuários"
        >
          <option value="recent">Cadastro recente</option>
          <option value="invites">Mais convites</option>
        </select>
      </div>

    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-muted-foreground">
          <tr>
            <th className="p-3">E-mail</th>
            <th className="p-3">Cadastro</th>
            <th className="p-3">Último acesso</th>
            <th className="p-3 text-right">Convites</th>
            <th className="p-3 text-right">Publicados</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-border/60 last:border-0">
              <td className="p-3">{u.email || "—"}</td>
              <td className="p-3 text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString("pt-BR")}
              </td>
              <td className="p-3 text-muted-foreground">
                {u.last_sign_in_at
                  ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR")
                  : "—"}
              </td>
              <td className="p-3 text-right tabular-nums">{u.invites}</td>
              <td className="p-3 text-right tabular-nums text-muted-foreground">
                {u.published ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      <p className="text-xs text-muted-foreground">
        {rows.length} de {data.length} usuários
      </p>
    </div>
  )
}

function AdminsTab() {
  const { data, isLoading, isError, error } = useAdminAdmins()
  const add = useAdminAddAdmin()
  const remove = useAdminRemoveAdmin()
  const [email, setEmail] = useState("")

  if (isLoading) return <Loading />
  if (isError || !data) return <ErrorBox message={(error as Error)?.message} />

  function handleAdd() {
    const value = email.trim()
    if (!value.includes("@")) {
      toast.error("Informe um e-mail válido.")
      return
    }
    add.mutate(value, {
      onSuccess: () => {
        toast.success("Admin adicionado.")
        setEmail("")
      },
      onError: () => toast.error("Não foi possível adicionar."),
    })
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={add.isPending}>
          {add.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          Adicionar
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {data.map((adminEmail) => (
          <div
            key={adminEmail}
            className="flex items-center justify-between border-b border-border/60 p-3 last:border-0"
          >
            <span className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-primary" />
              {adminEmail}
            </span>
            <button
              type="button"
              title="Remover admin"
              onClick={() => {
                if (window.confirm(`Remover ${adminEmail} dos admins?`))
                  remove.mutate(adminEmail, {
                    onSuccess: () => toast.success("Admin removido."),
                    onError: (err) =>
                      toast.error(
                        (err as Error)?.message?.includes("ultimo")
                          ? "Não dá pra remover o último admin."
                          : "Não foi possível remover.",
                      ),
                  })
              }}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Admins têm acesso a este painel e podem publicar sem pagar. O e-mail
        precisa ter feito login ao menos uma vez.
      </p>
    </div>
  )
}
