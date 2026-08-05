import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/hooks/useAuth"
import { useCreateInvite } from "@/hooks/useInvites"
import {
  clearGuestDraft,
  hasPublishIntent,
  loadGuestDraft,
} from "@/lib/guestDraft"

/**
 * Retoma a publicação de um convidado depois que ele cria conta / faz login.
 * Se há rascunho + intenção de publicar, cria o convite no banco e leva ao
 * checkout — mesmo que o login tenha redirecionado para o dashboard (Google).
 * Fica montado globalmente, fora das rotas.
 */
export function GuestPublishResumer() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const createInvite = useCreateInvite()
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current || !user || !hasPublishIntent()) return
    doneRef.current = true

    void loadGuestDraft().then((draft) => {
      if (!draft) {
        void clearGuestDraft()
        return
      }
      createInvite.mutate(
        {
          templateId: draft.templateId,
          category: draft.category,
          fields: draft.fields,
        },
        {
          onSuccess: (inv) => {
            void clearGuestDraft()
            navigate(`/checkout/${inv.id}`)
          },
          onError: () => {
            doneRef.current = false
            toast.error("Não foi possível salvar seu convite. Tente novamente.")
          },
        },
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return null
}
