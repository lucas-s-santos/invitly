import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  FileText,
  Loader2,
  Rocket,
  ShieldCheck,
  Trash2,
  Undo2,
  UserPlus,
  Users,
  X,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { isAdminEmail } from "@/lib/admin"
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

function StatsTab() {
  const { data, isLoading, isError, error } = useAdminStats()
  if (isLoading) return <Loading />
  if (isError || !data)
    return <ErrorBox message={(error as Error)?.message} />

  const cards = [
    { label: "Convites", value: data.invites },
    { label: "Publicados", value: data.published },
    { label: "Rascunhos", value: data.drafts },
    { label: "Confirmações", value: data.rsvps },
    { label: "Visualizações", value: data.views },
    { label: "Usuários", value: data.users },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-border bg-card p-5"
        >
          <p className="font-display text-3xl font-bold">{c.value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
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

function InvitesTab() {
  const { data, isLoading, isError, error } = useAdminInvites()
  const setStatus = useAdminSetStatus()
  const del = useAdminDeleteInvite()

  if (isLoading) return <Loading />
  if (isError || !data) return <ErrorBox message={(error as Error)?.message} />
  if (data.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhum convite ainda.</p>

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-muted-foreground">
          <tr>
            <th className="p-3">Convite</th>
            <th className="p-3">Dono</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Views</th>
            <th className="p-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((inv) => (
            <tr key={inv.id} className="border-b border-border/60 last:border-0">
              <td className="max-w-[200px] p-3">
                <p className="truncate font-medium">{inv.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(inv.created_at).toLocaleDateString("pt-BR")}
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
  )
}

function UsersTab() {
  const { data, isLoading, isError, error } = useAdminUsers()
  if (isLoading) return <Loading />
  if (isError || !data) return <ErrorBox message={(error as Error)?.message} />
  if (data.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhum usuário ainda.</p>

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs text-muted-foreground">
          <tr>
            <th className="p-3">E-mail</th>
            <th className="p-3">Cadastro</th>
            <th className="p-3 text-right">Convites</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u.id} className="border-b border-border/60 last:border-0">
              <td className="p-3">{u.email || "—"}</td>
              <td className="p-3 text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString("pt-BR")}
              </td>
              <td className="p-3 text-right tabular-nums">{u.invites}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
