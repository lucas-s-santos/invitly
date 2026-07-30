import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

import { BLANK_FIELDS, TEMPLATES } from "@/lib/templates"
import { useCreateInvite } from "@/hooks/useInvites"
import { useAuth } from "@/hooks/useAuth"
import { loadGuestDraft, saveGuestDraft } from "@/lib/guestDraft"
import { Button } from "@/components/ui/button"

/**
 * Entrada de criação: cai direto no editor com um convite em branco.
 * (A troca de visual acontece dentro do editor.)
 */
export default function TemplateSelect() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const createInvite = useCreateInvite()
  const ranRef = useRef(false)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (loading || ranRef.current) return
    ranRef.current = true

    const def = TEMPLATES[0]

    if (user) {
      createInvite.mutate(
        { templateId: def.id, category: def.category, fields: BLANK_FIELDS },
        {
          onSuccess: (invite) =>
            navigate(`/editor/${invite.id}`, { replace: true }),
        },
      )
    } else {
      if (!loadGuestDraft()) {
        saveGuestDraft({
          templateId: def.id,
          category: def.category,
          fields: BLANK_FIELDS,
        })
      }
      navigate("/criar/editor", { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])

  // Se demorar demais, oferece uma saída (evita spinner infinito)
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 7000)
    return () => clearTimeout(t)
  }, [])

  const failed = createInvite.isError

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      {failed ? (
        <>
          <p className="text-lg font-semibold">Não consegui criar o convite</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Verifique sua conexão e tente novamente.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                ranRef.current = false
                createInvite.reset()
                window.location.reload()
              }}
            >
              Tentar de novo
            </Button>
            <Button variant="outline" asChild>
              <Link to={user ? "/dashboard" : "/"}>Voltar</Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Preparando seu convite…
          </p>
          {slow ? (
            <Button variant="outline" size="sm" asChild>
              <Link to={user ? "/dashboard" : "/"}>Demorando? Voltar</Link>
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}
