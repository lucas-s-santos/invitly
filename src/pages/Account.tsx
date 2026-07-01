import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BrandMark } from "@/components/BrandMark"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { LanguageToggle } from "@/components/LanguageToggle"

export default function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const name =
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "—"

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.rpc("delete_my_account")
    if (error) {
      toast.error("Não foi possível excluir a conta. Tente de novo.")
      setDeleting(false)
      return
    }
    await signOut()
    toast.success("Sua conta foi excluída.")
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-svh bg-secondary/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Invitly">
            <BrandMark />
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="size-4" />
              Painel
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Minha conta</h1>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <Row label="Nome" value={name} />
            <Row label="E-mail" value={user?.email ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Idioma</p>
              <p className="text-sm text-muted-foreground">
                Escolha o idioma da interface.
              </p>
            </div>
            <LanguageToggle />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-wrap gap-4 pt-6 text-sm">
            <Link to="/privacidade" className="font-medium text-primary underline">
              Política de Privacidade
            </Link>
            <Link to="/termos" className="font-medium text-primary underline">
              Termos de Uso
            </Link>
          </CardContent>
        </Card>

        {/* Zona de perigo */}
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-destructive">Excluir minha conta</p>
              <p className="text-sm text-muted-foreground">
                Remove permanentemente sua conta, convites e confirmações. Não dá
                para desfazer.
              </p>
            </div>
            <Button
              variant="destructive"
              className="shrink-0"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="size-4" />
              Excluir conta
            </Button>
          </CardContent>
        </Card>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir sua conta?"
        description="Todos os seus convites e confirmações serão apagados permanentemente. Esta ação não pode ser desfeita."
        confirmLabel="Excluir minha conta"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
