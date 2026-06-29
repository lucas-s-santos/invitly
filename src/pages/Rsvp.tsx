import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { useInviteBySlug } from "@/hooks/useInvites"
import { getTemplate } from "@/lib/templates"
import type { InviteFields } from "@/types"
import { Button } from "@/components/ui/button"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import { RsvpForm } from "@/components/invite/RsvpForm"

export default function Rsvp() {
  const { slug } = useParams()
  const { data: invite, isLoading } = useInviteBySlug(slug)

  if (isLoading) return <FullScreenLoader />

  if (!invite) {
    return (
      <div className="bg-brand-aurora flex min-h-svh flex-col items-center justify-center px-6 text-center text-white">
        <h1 className="font-display text-2xl font-bold">
          Convite não encontrado
        </h1>
        <Button asChild className="mt-6">
          <Link to="/">Página inicial</Link>
        </Button>
      </div>
    )
  }

  const template = getTemplate(invite.template_id)
  const fields = invite.data as InviteFields
  const accent = fields.primary_color || template?.style.accentColor || "#ff6b9d"

  return (
    <div className="bg-brand-aurora flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link to={`/convite/${slug}`}>
            <ArrowLeft className="size-4" />
            Voltar ao convite
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-bold">{fields.title}</h1>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          Confirme sua presença abaixo 💜
        </p>
        <RsvpForm inviteId={invite.id} accentColor={accent} />
      </div>
    </div>
  )
}
