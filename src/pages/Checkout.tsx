import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  Rocket,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

import { useInvite, usePublishInvite } from "@/hooks/useInvites"
import { getTemplate } from "@/lib/templates"
import { formatLongDate } from "@/lib/date"
import type { InviteFields } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import { PagePlaceholder } from "@/components/PagePlaceholder"
import { TemplatePreview } from "@/components/invite/TemplatePreview"

const BENEFITS = [
  "Página do convite publicada e compartilhável",
  "Animações e contagem regressiva",
  "Confirmações de presença (RSVP) ilimitadas",
  "QR Code e adicionar à agenda",
  "Lista de confirmados + analytics",
]

export default function Checkout() {
  const { id } = useParams()
  const { data: invite, isLoading } = useInvite(id)
  const publish = usePublishInvite()
  const [redirecting, setRedirecting] = useState(false)

  const kiwifyUrl = import.meta.env.VITE_KIWIFY_CHECKOUT_URL
  const price = import.meta.env.VITE_KIWIFY_PRICE || "R$ 12,90"
  const configured = Boolean(kiwifyUrl)

  if (isLoading) return <FullScreenLoader />
  if (!invite) {
    return (
      <PagePlaceholder
        title="Convite não encontrado"
        backTo="/dashboard"
        backLabel="Voltar ao painel"
      />
    )
  }

  const template = getTemplate(invite.template_id)
  const fields = invite.data as InviteFields
  const publicUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/convite/${invite.slug}`
  const isPublished = invite.status === "published"

  function pay() {
    if (!kiwifyUrl || !invite) return
    setRedirecting(true)
    const sep = kiwifyUrl.includes("?") ? "&" : "?"
    // sck = código de rastreio da Kiwify (volta no webhook p/ publicar o convite certo)
    window.location.href = `${kiwifyUrl}${sep}sck=${invite.id}`
  }

  return (
    <div className="min-h-svh bg-secondary/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link to={`/editor/${invite.id}`}>
              <ArrowLeft className="size-4" />
              Voltar ao editor
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_320px]">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {isPublished ? "Convite publicado 🎉" : "Publicar convite"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isPublished
              ? "Seu convite já está no ar. Compartilhe o link com os convidados!"
              : "Falta pouco! Publique para liberar o link e receber confirmações."}
          </p>

          {isPublished ? (
            <Card className="mt-6">
              <CardContent className="space-y-3 pt-6">
                <p className="break-all text-sm text-muted-foreground">
                  {publicUrl}
                </p>
                <Button asChild className="w-full">
                  <a href={publicUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Ver convite
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ul className="mt-6 space-y-2.5">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Resumo / pagamento */}
        <Card className="h-fit overflow-hidden py-0">
          {template ? (
            <div className="relative aspect-[16/10] overflow-hidden border-b border-border">
              <TemplatePreview
                template={{ ...template, defaultData: fields }}
                className="absolute inset-0 h-full w-full"
              />
            </div>
          ) : null}
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="truncate font-semibold">{fields.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatLongDate(fields.event_date)}
              </p>
            </div>

            {!isPublished ? (
              <>
                <div className="flex items-baseline justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-display text-2xl font-bold">{price}</span>
                </div>

                {configured ? (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={pay}
                    disabled={redirecting}
                  >
                    {redirecting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Rocket className="size-4" />
                    )}
                    Pagar com Kiwify
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                      Pagamento ainda não configurado (falta o link da Kiwify).
                      Use o botão abaixo para publicar em modo de teste.
                    </div>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      disabled={publish.isPending}
                      onClick={() =>
                        publish.mutate(invite.id, {
                          onSuccess: () => toast.success("Convite publicado! 🎉"),
                          onError: () => toast.error("Não foi possível publicar."),
                        })
                      }
                    >
                      {publish.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Publicar em modo de teste
                    </Button>
                  </div>
                )}

                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  Pagamento seguro via Kiwify
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
