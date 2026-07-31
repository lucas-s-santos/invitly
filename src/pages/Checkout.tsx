import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Check,
  Crown,
  ExternalLink,
  Loader2,
  Rocket,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

import { useInvite, usePublishInvite, useUpdateInvite } from "@/hooks/useInvites"
import { useAuth } from "@/hooks/useAuth"
import { isAdminEmail } from "@/lib/admin"
import { getTemplate } from "@/lib/templates"
import { formatLongDate } from "@/lib/date"
import type { InviteFields, InvitePlan } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import { PagePlaceholder } from "@/components/PagePlaceholder"
import { TemplatePreview } from "@/components/invite/TemplatePreview"

const BASIC_FEATURES = [
  "Convite animado completo",
  "Sua foto de fundo",
  "Contagem, RSVP, QR e agenda",
  "Mapa e compartilhamento",
]
const PREMIUM_FEATURES = [
  "Tudo do Básico, mais:",
  "Galeria de fotos",
  "Lista de presentes + PIX",
  "Música de fundo",
  "Filtros e fontes exclusivas",
]

/** Lista os recursos Premium que o usuário já configurou no convite. */
function premiumFeaturesUsed(fields: InviteFields): string[] {
  const used: string[] = []
  if (fields.music_url?.trim()) used.push("🎵 Música")
  if (fields.gallery && fields.gallery.length > 0) used.push("📸 Galeria")
  if (
    fields.pix_key?.trim() ||
    fields.gift_url?.trim() ||
    (fields.gift_items && fields.gift_items.some((g) => g.name.trim()))
  )
    used.push("🎁 Presentes/PIX")
  if (fields.background_filter && fields.background_filter !== "none")
    used.push("🎨 Filtro da foto")
  if (fields.font_family) used.push("✍️ Fonte especial")
  return used
}

export default function Checkout() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: invite, isLoading } = useInvite(id)
  const publish = usePublishInvite()
  const update = useUpdateInvite()
  const [redirecting, setRedirecting] = useState(false)
  const [plan, setPlan] = useState<InvitePlan>("basico")
  const isAdmin = isAdminEmail(user?.email)

  useEffect(() => {
    const p = (invite?.data as InviteFields | undefined)?.plan
    if (p) setPlan(p)
  }, [invite])

  const basicUrl = import.meta.env.VITE_KIWIFY_CHECKOUT_URL
  const premiumUrl = import.meta.env.VITE_KIWIFY_CHECKOUT_URL_PREMIUM
  const basicPrice = import.meta.env.VITE_KIWIFY_PRICE || "R$ 12,90"
  const premiumPrice = import.meta.env.VITE_KIWIFY_PRICE_PREMIUM || "R$ 19,90"

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

  const chosenUrl = plan === "premium" ? premiumUrl : basicUrl
  const chosenPrice = plan === "premium" ? premiumPrice : basicPrice
  const premiumUsed = premiumFeaturesUsed(fields)
  const showUpsell = plan === "basico" && premiumUsed.length > 0
  const configured = Boolean(chosenUrl)

  async function persistPlan() {
    if (!invite) return
    try {
      await update.mutateAsync({ id: invite.id, fields: { ...fields, plan } })
    } catch {
      // se falhar o save do plano, segue mesmo assim
    }
  }

  async function pay() {
    if (!chosenUrl || !invite) return
    setRedirecting(true)
    await persistPlan()
    const sep = chosenUrl.includes("?") ? "&" : "?"
    // sck = rastreio da Kiwify (volta no webhook p/ publicar o convite certo)
    window.location.href = `${chosenUrl}${sep}sck=${invite.id}`
  }

  async function freePublish() {
    if (!invite) return
    await persistPlan()
    publish.mutate(invite.id, {
      onSuccess: () => toast.success("Publicado! 🎉"),
      onError: () => toast.error("Não foi possível publicar."),
    })
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
            {isPublished ? "Convite publicado 🎉" : "Escolha seu plano"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isPublished
              ? "Seu convite já está no ar. Compartilhe o link com os convidados!"
              : "Publique para liberar o link e receber confirmações."}
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
            <div className="mt-6 space-y-3">
              <PlanCard
                active={plan === "basico"}
                onClick={() => setPlan("basico")}
                title="Básico"
                price={basicPrice}
                features={BASIC_FEATURES}
              />
              <PlanCard
                active={plan === "premium"}
                onClick={() => setPlan("premium")}
                title="Premium"
                price={premiumPrice}
                features={PREMIUM_FEATURES}
                premium
              />
            </div>
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
                  <span className="text-sm text-muted-foreground">
                    Plano {plan === "premium" ? "Premium" : "Básico"}
                  </span>
                  <span className="font-display text-2xl font-bold">
                    {chosenPrice}
                  </span>
                </div>

                {showUpsell ? (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
                    <p className="text-sm font-semibold">
                      ⭐ Você adicionou recursos Premium
                    </p>
                    <p className="mt-1 text-xs">{premiumUsed.join(" · ")}</p>
                    <p className="mt-2 text-xs leading-relaxed">
                      No plano <strong>Básico</strong> eles{" "}
                      <strong>não vão aparecer</strong> no convite. Publique como
                      Premium para liberar tudo.
                    </p>
                    <Button
                      size="sm"
                      className="mt-2.5 w-full"
                      onClick={() => setPlan("premium")}
                    >
                      <Crown className="size-4" />
                      Mudar para Premium ({premiumPrice})
                    </Button>
                  </div>
                ) : null}

                {isAdmin ? (
                  <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-medium text-primary">
                      👑 Conta administradora — publica sem pagar.
                    </p>
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={publish.isPending || update.isPending}
                      onClick={() => void freePublish()}
                    >
                      {publish.isPending || update.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="size-4" />
                      )}
                      Publicar grátis (admin)
                    </Button>
                  </div>
                ) : null}

                {configured ? (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => void pay()}
                    disabled={redirecting}
                  >
                    {redirecting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Rocket className="size-4" />
                    )}
                    Pagar {chosenPrice}
                  </Button>
                ) : plan === "premium" ? (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                    O plano Premium ainda está sendo configurado. Escolha o
                    Básico ou tente em instantes.
                  </div>
                ) : import.meta.env.DEV ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    disabled={publish.isPending}
                    onClick={() => void freePublish()}
                  >
                    {publish.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    [DEV] Publicar em modo de teste
                  </Button>
                ) : (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                    Pagamento temporariamente indisponível.
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

function PlanCard({
  active,
  onClick,
  title,
  price,
  features,
  premium = false,
}: {
  active: boolean
  onClick: () => void
  title: string
  price: string
  features: string[]
  premium?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 p-4 text-left transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-display text-lg font-bold">
          {premium ? <Crown className="size-4 text-amber-500" /> : null}
          {title}
        </span>
        <span className="font-display text-xl font-bold">{price}</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  )
}
