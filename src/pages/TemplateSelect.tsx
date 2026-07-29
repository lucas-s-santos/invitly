import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

import { BLANK_FIELDS, TEMPLATES } from "@/lib/templates"
import { useCreateInvite } from "@/hooks/useInvites"
import { useAuth } from "@/hooks/useAuth"
import { loadGuestDraft, saveGuestDraft } from "@/lib/guestDraft"
import { FullScreenLoader } from "@/components/FullScreenLoader"

/**
 * Entrada de criação: em vez de mostrar a grade cheia de templates, cai direto
 * no editor com um template padrão. A troca de visual acontece dentro do editor.
 */
export default function TemplateSelect() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const createInvite = useCreateInvite()
  const ranRef = useRef(false)

  useEffect(() => {
    if (loading || ranRef.current) return
    ranRef.current = true

    const def = TEMPLATES[0]

    if (user) {
      // Logado: cria um convite em branco no banco e vai pro editor
      createInvite.mutate(
        { templateId: def.id, category: def.category, fields: BLANK_FIELDS },
        {
          onSuccess: (invite) =>
            navigate(`/editor/${invite.id}`, { replace: true }),
          onError: () => {
            ranRef.current = false
            navigate("/dashboard", { replace: true })
          },
        },
      )
    } else {
      // Convidado: retoma o rascunho existente ou cria um em branco
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

  return <FullScreenLoader />
}
