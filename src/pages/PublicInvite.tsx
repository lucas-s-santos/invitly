import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import {
  CalendarPlus,
  Check,
  Copy,
  Download,
  Gift,
  Heart,
  MapPin,
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
import { buildPixPayload } from "@/lib/pix"
import type { InviteFields } from "@/types"
import { Button } from "@/components/ui/button"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import { InviteRenderer } from "@/components/invite/InviteRenderer"
import { InviteEffects } from "@/components/invite/effects/InviteEffects"
import { InviteOpening } from "@/components/invite/effects/InviteOpening"
import { MusicPlayer } from "@/components/invite/MusicPlayer"
import { GalleryCarousel } from "@/components/invite/GalleryCarousel"
import { RsvpForm } from "@/components/invite/RsvpForm"

export default function PublicInvite() {
  const { slug } = useParams()
  const { data: invite, isLoading } = useInviteBySlug(slug)
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [agendaOpen, setAgendaOpen] = useState(false)
  const [giftOpen, setGiftOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pixCopied, setPixCopied] = useState(false)
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

  // Extras opcionais do convite
  const mapsHref = fields.maps_url?.trim()
    ? fields.maps_url.trim()
    : fields.location?.trim()
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fields.location)}`
      : null
  const gallery = fields.gallery ?? []
  const isPremium = fields.plan === "premium"
  const giftItems = (fields.gift_items ?? []).filter((g) => g.name.trim())
  const hasGifts =
    isPremium &&
    Boolean(
      fields.pix_key?.trim() || fields.gift_url?.trim() || giftItems.length > 0,
    )
  const pixPayload = fields.pix_key?.trim()
    ? buildPixPayload({
        key: fields.pix_key.trim(),
        name: fields.pix_name || fields.hosts || fields.title,
        city: fields.pix_city,
      })
    : ""

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function copyPix() {
    await navigator.clipboard.writeText(pixPayload)
    setPixCopied(true)
    setTimeout(() => setPixCopied(false), 2000)
  }

  return (
    <div className="relative min-h-svh">
      {template ? (
        <>
          <InviteRenderer
            template={template}
            fields={fields}
            animate
            premium={isPremium}
            className="min-h-svh pb-52"
          >
            {opened && isPremium && (gallery.length > 0 || fields.music_url) ? (
              <div className="flex flex-col items-center gap-5">
                {gallery.length > 0 ? (
                  <GalleryCarousel
                    images={gallery}
                    height={fields.gallery_height ?? 128}
                  />
                ) : null}
                {fields.music_url ? (
                  <MusicPlayer
                    active={opened}
                    url={fields.music_url}
                    title={fields.music_title}
                    artist={fields.music_artist}
                    cover={fields.music_cover}
                    accent={accent}
                  />
                ) : null}
              </div>
            ) : null}
          </InviteRenderer>
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
      <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 bg-gradient-to-t from-black/50 to-transparent px-4 pb-6 pt-10">
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
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              size="lg"
              variant="secondary"
              className="shadow-lg"
              onClick={() => setAgendaOpen(true)}
            >
              <CalendarPlus className="size-4" />
              Agenda
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="shadow-lg"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="size-4" />
              Enviar
            </Button>
            {hasGifts ? (
              <Button
                size="lg"
                variant="secondary"
                className="shadow-lg"
                onClick={() => setGiftOpen(true)}
              >
                <Gift className="size-4" />
                Presentes
              </Button>
            ) : null}
            {mapsHref ? (
              <Button asChild size="lg" variant="secondary" className="shadow-lg">
                <a href={mapsHref} target="_blank" rel="noreferrer">
                  <MapPin className="size-4" />
                  Como chegar
                </a>
              </Button>
            ) : null}
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

      {/* Modal Presentes / PIX */}
      {giftOpen ? (
        <Modal title="Presentes" onClose={() => setGiftOpen(false)}>
          <div className="space-y-4">
            {fields.gift_message ? (
              <p className="text-center text-sm leading-relaxed text-muted-foreground">
                {fields.gift_message}
              </p>
            ) : null}

            {giftItems.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Lista de presentes
                </p>
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {giftItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                    >
                      <span>{item.name}</span>
                      {item.price ? (
                        <span className="shrink-0 font-medium text-muted-foreground">
                          {item.price}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {pixPayload ? (
              <>
                <div className="flex justify-center">
                  <div className="rounded-xl border border-border bg-white p-3">
                    <QRCodeSVG value={pixPayload} size={168} fgColor="#1a0533" />
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Escaneie no app do seu banco ou use o código abaixo
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => void copyPix()}
                >
                  {pixCopied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {pixCopied ? "Código copiado!" : "Copiar código PIX"}
                </Button>
                {fields.pix_key ? (
                  <p className="truncate text-center text-xs text-muted-foreground">
                    Chave: {fields.pix_key}
                  </p>
                ) : null}
              </>
            ) : null}

            {fields.gift_url ? (
              <Button
                asChild
                size="lg"
                className="w-full"
                style={{ backgroundColor: accent }}
              >
                <a href={fields.gift_url} target="_blank" rel="noreferrer">
                  <Gift className="size-4" />
                  Ver lista de presentes
                </a>
              </Button>
            ) : null}
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
