import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import {
  CalendarPlus,
  Check,
  Copy,
  Download,
  Heart,
  PartyPopper,
  Share2,
  Sparkles,
  X,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import { useInviteBySlug } from "@/hooks/useInvites"
import { supabase } from "@/lib/supabase"
import { getTemplate } from "@/lib/templates"
import { buildGoogleCalendarUrl, downloadIcs } from "@/lib/calendar"
import type { InviteFields } from "@/types"
import { Button } from "@/components/ui/button"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import { InviteRenderer } from "@/components/invite/InviteRenderer"
import { InviteEffects } from "@/components/invite/effects/InviteEffects"
import { InviteOpening } from "@/components/invite/effects/InviteOpening"
import { RsvpForm } from "@/components/invite/RsvpForm"

export default function PublicInvite() {
  const { slug } = useParams()
  const { data: invite, isLoading } = useInviteBySlug(slug)
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [agendaOpen, setAgendaOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [replay, setReplay] = useState(0)
  const [opened, setOpened] = useState(false)
  const viewedRef = useRef(false)

  // Registra a visualização uma vez (anonimizado, via RPC security definer)
  useEffect(() => {
    if (!invite || viewedRef.current) return
    viewedRef.current = true
    const device = window.innerWidth < 768 ? "mobile" : "desktop"
    void supabase.rpc("register_invite_view", {
      p_slug: invite.slug,
      p_device: device,
    })
  }, [invite])

  if (isLoading) return <FullScreenLoader />

  if (!invite) {
    return (
      <div className="bg-brand-aurora flex min-h-svh flex-col items-center justify-center px-6 text-center text-white">
        <PartyPopper className="size-12 text-brand-gold" />
        <h1 className="mt-4 font-display text-2xl font-bold">
          Convite não encontrado
        </h1>
        <p className="mt-2 max-w-sm text-white/70">
          Este convite não existe, ainda não foi publicado ou expirou.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Criar o meu convite</Link>
        </Button>
      </div>
    )
  }

  const template = getTemplate(invite.template_id)
  const fields = invite.data as InviteFields
  const accent = fields.primary_color || template?.style.accentColor || "#ff6b9d"
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const waText = encodeURIComponent(`Você está convidado: ${fields.title}! ${shareUrl}`)
  const googleCalUrl = buildGoogleCalendarUrl(fields)

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative min-h-svh">
      {template ? (
        <>
          <InviteRenderer
            template={template}
            fields={fields}
            animate
            className="min-h-svh pb-28"
          />
          {opened ? (
            <InviteEffects template={template} replayKey={replay} />
          ) : null}
        </>
      ) : null}

      {/* Tela de abertura (cortina) */}
      {template && !opened ? (
        <InviteOpening
          title={fields.title}
          background={template.style.background}
          accentColor={accent}
          motif={template.style.motif}
          onOpen={() => setOpened(true)}
        />
      ) : null}

      {/* Barra de ações flutuante */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 bg-gradient-to-t from-black/40 to-transparent px-4 pb-6 pt-10">
        <div className="flex w-full max-w-sm flex-col gap-2">
          <Button
            size="lg"
            className="w-full shadow-lg"
            style={{ backgroundColor: accent }}
            onClick={() => setRsvpOpen(true)}
          >
            <Heart className="size-4" />
            Confirmar presença
          </Button>
          <div className="flex gap-2">
            <Button
              size="lg"
              variant="secondary"
              className="flex-1 shadow-lg"
              onClick={() => setAgendaOpen(true)}
            >
              <CalendarPlus className="size-4" />
              Agenda
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1 shadow-lg"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="size-4" />
              Enviar
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="shadow-lg"
              onClick={() => setReplay((n) => n + 1)}
              aria-label="Repetir animação"
            >
              <Sparkles className="size-4" />
            </Button>
          </div>
        </div>
        <Link
          to="/"
          className="text-xs font-medium text-white/80 drop-shadow hover:text-white"
        >
          Criado com <span className="font-bold">Invitly</span>
        </Link>
      </div>

      {/* Modal RSVP */}
      {rsvpOpen ? (
        <Modal title="Confirmar presença" onClose={() => setRsvpOpen(false)}>
          <RsvpForm inviteId={invite.id} accentColor={accent} />
        </Modal>
      ) : null}

      {/* Modal Compartilhar */}
      {shareOpen ? (
        <Modal title="Compartilhar convite" onClose={() => setShareOpen(false)}>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-xl border border-border bg-white p-3">
                <QRCodeSVG value={shareUrl} size={148} fgColor="#1a0533" />
              </div>
            </div>
            <Button asChild size="lg" className="w-full bg-[#25D366] hover:bg-[#1eb959]">
              <a
                href={`https://wa.me/?text=${waText}`}
                target="_blank"
                rel="noreferrer"
              >
                <Share2 className="size-4" />
                Enviar pelo WhatsApp
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => void copyLink()}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Link copiado!" : "Copiar link"}
            </Button>
            <p className="truncate text-center text-xs text-muted-foreground">
              {shareUrl}
            </p>
          </div>
        </Modal>
      ) : null}

      {/* Modal Adicionar à agenda */}
      {agendaOpen ? (
        <Modal title="Adicionar à agenda" onClose={() => setAgendaOpen(false)}>
          <div className="space-y-3">
            {googleCalUrl ? (
              <Button asChild size="lg" className="w-full">
                <a href={googleCalUrl} target="_blank" rel="noreferrer">
                  <CalendarPlus className="size-4" />
                  Google Agenda
                </a>
              </Button>
            ) : null}
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => downloadIcs(fields)}
            >
              <Download className="size-4" />
              Baixar .ics (Apple / Outlook)
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Salve a data no seu calendário e não esqueça do evento 🗓️
            </p>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm animate-in fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-background p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
