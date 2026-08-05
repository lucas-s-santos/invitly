import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { CATEGORIES } from "@/lib/categories"
import { getTemplatesByCategory } from "@/lib/templates"
import { useCreateInvite } from "@/hooks/useInvites"
import { useAuth } from "@/hooks/useAuth"
import { saveGuestDraft } from "@/lib/guestDraft"
import { Button } from "@/components/ui/button"

/**
 * Escolha por OCASIÃO: cards de evento (com foto). Ao escolher, cria um convite
 * já com um modelo bonito daquela categoria e vai pro editor.
 */
export default function TemplateSelect() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const createInvite = useCreateInvite()
  const [pending, setPending] = useState<string | null>(null)

  async function pick(categoryId: string) {
    const tpl = getTemplatesByCategory(categoryId)[0]
    if (!tpl) return

    if (user) {
      setPending(categoryId)
      createInvite.mutate(
        { templateId: tpl.id, category: categoryId },
        {
          onSuccess: (invite) => navigate(`/editor/${invite.id}`),
          onError: () => setPending(null),
        },
      )
    } else {
      setPending(categoryId)
      try {
        await saveGuestDraft({
          templateId: tpl.id,
          category: categoryId,
          fields: tpl.defaultData,
        })
        navigate("/criar/editor")
      } catch {
        setPending(null)
        toast.error("Não foi possível começar o convite neste navegador.")
      }
    }
  }

  return (
    <div className="min-h-svh bg-secondary/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link to={user ? "/dashboard" : "/"}>
              <ArrowLeft className="size-4" />
              {user ? t("nav.dashboard") : "Início"}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-center font-display text-3xl font-bold sm:text-4xl">
          Qual é a ocasião?
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Escolha o tipo de evento — você ajusta o texto, as cores e tudo depois.
        </p>

        {createInvite.isError ? (
          <p className="mt-4 text-center text-sm text-destructive">
            Não foi possível criar o convite. Tente novamente.
          </p>
        ) : null}

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {CATEGORIES.map((cat) => {
            const photo =
              getTemplatesByCategory(cat.id)[0]?.defaultData.background_image
            const isPending = pending === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                disabled={createInvite.isPending}
                onClick={() => void pick(cat.id)}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-sm transition-transform hover:-translate-y-1 disabled:opacity-60"
              >
                {photo ? (
                  <img
                    src={photo}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: cat.palette?.[0] ?? "#eee" }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-left text-white">
                  <span className="text-2xl drop-shadow">{cat.emoji}</span>
                  <p className="mt-1 font-display text-lg leading-tight font-bold drop-shadow">
                    {t(cat.labelKey)}
                  </p>
                </div>
                {isPending ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="size-6 animate-spin text-white" />
                  </div>
                ) : null}
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
