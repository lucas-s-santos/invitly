import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Check,
  Cloud,
  Copy,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  Monitor,
  Music,
  Rocket,
  Smartphone,
  Trash2,
  Users,
  X,
} from "lucide-react"

import { toast } from "sonner"

import {
  useCreateInvite,
  useInvite,
  useUpdateInvite,
} from "@/hooks/useInvites"
import { useAuth } from "@/hooks/useAuth"
import { getTemplate } from "@/lib/templates"
import { uploadInviteImage, uploadInviteAudio } from "@/lib/storage"
import { compressImageToDataUrl } from "@/lib/image"
import { FONT_OPTIONS } from "@/lib/fonts"
import {
  clearGuestDraft,
  loadGuestDraft,
  saveGuestDraft,
  setPublishIntent,
} from "@/lib/guestDraft"
import { BACKGROUND_PATTERNS, type BackgroundPattern } from "@/lib/backgrounds"
import { cn } from "@/lib/utils"
import type { InviteFields } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import { PagePlaceholder } from "@/components/PagePlaceholder"
import { InviteRenderer } from "@/components/invite/InviteRenderer"
import { PhotoAdjuster } from "@/components/invite/PhotoAdjuster"
import { GalleryCarousel } from "@/components/invite/GalleryCarousel"

type SaveStatus = "idle" | "saving" | "saved"

export default function Editor() {
  const { id } = useParams()
  const isGuest = !id // rota /criar/editor (sem :id) = modo convidado
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: invite, isLoading, isError } = useInvite(id)
  const update = useUpdateInvite()
  const createInvite = useCreateInvite()

  const guestDraft = useMemo(
    () => (isGuest ? loadGuestDraft() : null),
    [isGuest],
  )

  const [fields, setFields] = useState<InviteFields | null>(null)
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile")
  const [showPreview, setShowPreview] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const dirtyRef = useRef(false)
  const initRef = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const audioFileRef = useRef<HTMLInputElement>(null)

  // Inicializa o formulário (do banco, ou do rascunho local se convidado)
  useEffect(() => {
    if (initRef.current) return
    if (isGuest) {
      if (guestDraft) {
        setFields(guestDraft.fields)
        initRef.current = true
      }
    } else if (invite) {
      setFields(invite.data as InviteFields)
      initRef.current = true
    }
  }, [invite, isGuest, guestDraft])

  // Auto-save com debounce (1.2s) — banco ou localStorage
  useEffect(() => {
    if (!fields || !dirtyRef.current) return
    setSaveStatus("saving")
    const timeout = setTimeout(() => {
      if (isGuest) {
        if (guestDraft) {
          saveGuestDraft({
            templateId: guestDraft.templateId,
            category: guestDraft.category,
            fields,
          })
        }
        dirtyRef.current = false
        setSaveStatus("saved")
      } else if (id) {
        update.mutate(
          { id, title: fields.title, fields },
          {
            onSuccess: () => {
              dirtyRef.current = false
              setSaveStatus("saved")
            },
          },
        )
      }
    }, 1200)
    return () => clearTimeout(timeout)
    // update/createInvite são estáveis; não incluir para evitar loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, id, isGuest])

  const template = isGuest
    ? guestDraft
      ? getTemplate(guestDraft.templateId)
      : undefined
    : invite
      ? getTemplate(invite.template_id)
      : undefined

  if (publishing) return <FullScreenLoader />
  if (!isGuest && isLoading) return <FullScreenLoader />
  if (isGuest && !guestDraft) {
    return (
      <PagePlaceholder
        title="Nenhum rascunho por aqui"
        description="Comece escolhendo um template para criar seu convite."
        backTo="/editor/novo"
        backLabel="Escolher template"
      />
    )
  }
  if (!isGuest && (isError || !invite)) {
    return (
      <PagePlaceholder
        title="Convite não encontrado"
        description="Esse convite não existe ou você não tem acesso a ele."
        backTo="/dashboard"
        backLabel="Voltar ao painel"
      />
    )
  }
  if (!template || !fields) return <FullScreenLoader />

  const isPublished = !isGuest && invite?.status === "published"
  const publicUrl =
    !isGuest && invite
      ? `${import.meta.env.VITE_APP_URL || window.location.origin}/convite/${invite.slug}`
      : ""

  function set<K extends keyof InviteFields>(key: K, value: InviteFields[K]) {
    dirtyRef.current = true
    setFields((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function patch(p: Partial<InviteFields>) {
    dirtyRef.current = true
    setFields((prev) => (prev ? { ...prev, ...p } : prev))
  }

  function applyPattern(p: BackgroundPattern) {
    dirtyRef.current = true
    setFields((prev) =>
      prev
        ? {
            ...prev,
            background_color: p.css,
            text_mode: p.text,
            background_image: undefined,
          }
        : prev,
    )
  }

  function resetBackground() {
    dirtyRef.current = true
    setFields((prev) =>
      prev
        ? { ...prev, background_color: undefined, text_mode: undefined }
        : prev,
    )
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success("Link copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleImageFile(file: File | undefined) {
    if (!file || !id) return
    setUploadError(null)
    setUploading(true)
    try {
      const url = await uploadInviteImage(file, id)
      set("background_image", url)
      toast.success("Foto de fundo atualizada!")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha no upload."
      setUploadError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleGuestImageFile(file: File | undefined) {
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const dataUrl = await compressImageToDataUrl(file)
      set("background_image", dataUrl)
      toast.success("Foto de fundo adicionada!")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao carregar a foto."
      setUploadError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  // Capa da música: convidado guarda comprimida (sobe ao publicar); logado sobe já.
  async function handleCoverFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      if (isGuest) {
        set("music_cover", await compressImageToDataUrl(file, 600))
      } else if (id) {
        set("music_cover", await uploadInviteImage(file, id))
      }
      toast.success("Capa da música atualizada!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar a capa.")
    } finally {
      setUploading(false)
      if (coverRef.current) coverRef.current.value = ""
    }
  }

  // Upload de mp3 (só logado — áudio é pesado demais p/ rascunho local).
  async function handleAudioFile(file: File | undefined) {
    if (!file || !id) return
    setUploading(true)
    try {
      set("music_url", await uploadInviteAudio(file, id))
      toast.success("Música enviada!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar o áudio.")
    } finally {
      setUploading(false)
      if (audioFileRef.current) audioFileRef.current.value = ""
    }
  }

  async function handleGalleryFile(file: File | undefined) {
    if (!file || !id) return
    setUploading(true)
    try {
      const url = await uploadInviteImage(file, id)
      dirtyRef.current = true
      setFields((prev) =>
        prev ? { ...prev, gallery: [...(prev.gallery ?? []), url] } : prev,
      )
      toast.success("Foto adicionada à galeria!")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha no upload."
      toast.error(msg)
    } finally {
      setUploading(false)
      if (galleryRef.current) galleryRef.current.value = ""
    }
  }

  function removeGalleryImage(url: string) {
    dirtyRef.current = true
    setFields((prev) =>
      prev
        ? { ...prev, gallery: (prev.gallery ?? []).filter((u) => u !== url) }
        : prev,
    )
  }

  function handlePublish() {
    if (!fields) return
    const missing: string[] = []
    if (!fields.title.trim()) missing.push("título")
    if (!fields.event_date) missing.push("data do evento")
    if (missing.length > 0) {
      toast.error(`Preencha ${missing.join(" e ")} antes de publicar.`)
      return
    }

    if (isGuest) {
      if (!guestDraft) return
      // salva o rascunho atual antes de seguir
      saveGuestDraft({
        templateId: guestDraft.templateId,
        category: guestDraft.category,
        fields,
      })
      if (user) {
        // já logado: cria o convite e vai pro checkout
        setPublishing(true)
        createInvite.mutate(
          {
            templateId: guestDraft.templateId,
            category: guestDraft.category,
            fields,
          },
          {
            onSuccess: (inv) => {
              clearGuestDraft()
              navigate(`/checkout/${inv.id}`)
            },
            onError: () => {
              setPublishing(false)
              toast.error("Não foi possível salvar. Tente de novo.")
            },
          },
        )
      } else {
        // pede cadastro; volta pra cá com a intenção de publicar
        setPublishIntent()
        navigate("/login", {
          state: { from: "/criar/editor", intent: "publish" },
        })
      }
      return
    }

    if (!invite) return
    navigate(`/checkout/${invite.id}`)
  }

  return (
    <div className="flex min-h-svh flex-col bg-secondary/40">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link to={isGuest ? "/editor/novo" : "/dashboard"}>
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">{template.name}</span>
            </Link>
          </Button>

          <SaveIndicator status={saveStatus} />

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-lg border border-border p-0.5 sm:flex">
              <DeviceButton
                active={device === "mobile"}
                onClick={() => setDevice("mobile")}
                icon={<Smartphone className="size-4" />}
              />
              <DeviceButton
                active={device === "desktop"}
                onClick={() => setDevice("desktop")}
                icon={<Monitor className="size-4" />}
              />
            </div>
            {isPublished ? (
              <Button asChild size="sm" variant="outline">
                <a href={publicUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  <span className="hidden sm:inline">Ver convite</span>
                </a>
              </Button>
            ) : (
              <Button size="sm" onClick={handlePublish}>
                <Rocket className="size-4" />
                Publicar
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_1fr]">
        {/* Painel de propriedades */}
        <div className="space-y-5">
          {isGuest ? (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
              <p className="font-semibold text-primary">
                ✨ Criando sem cadastro
              </p>
              <p className="mt-1 text-muted-foreground">
                Personalize à vontade — seu rascunho fica salvo neste navegador.
                Você só cria a conta na hora de <strong>publicar</strong>.
              </p>
            </div>
          ) : null}

          {isPublished ? (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm">
              <p className="font-semibold text-emerald-900">
                Convite publicado! 🎉
              </p>
              <p className="mt-1 break-all text-emerald-800">{publicUrl}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => void copyLink()}
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? "Copiado!" : "Copiar link"}
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link to={`/convite/${invite?.slug}/lista`}>
                    <Users className="size-4" />
                    Confirmados
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}

          <Field label="Título do evento" hint={`${fields.title.length}/80`}>
            <Input
              value={fields.title}
              maxLength={80}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
          <Field label="Anfitriões / Nomes">
            <Input
              value={fields.hosts}
              maxLength={80}
              onChange={(e) => set("hosts", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data">
              <Input
                type="date"
                value={fields.event_date}
                onChange={(e) => set("event_date", e.target.value)}
              />
            </Field>
            <Field label="Horário">
              <Input
                type="time"
                value={fields.event_time}
                onChange={(e) => set("event_time", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Local">
            <Input
              value={fields.location}
              maxLength={120}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
          <Field label="Mensagem" hint={`${fields.message.length}/400`}>
            <Textarea
              value={fields.message}
              maxLength={400}
              rows={4}
              onChange={(e) => set("message", e.target.value)}
            />
          </Field>

          {/* Padrões de fundo */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">Padrões de fundo</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              <button
                type="button"
                onClick={resetBackground}
                title="Usar o fundo do template"
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg border text-[10px] font-medium text-muted-foreground",
                  !fields.background_color
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50",
                )}
              >
                Tema
              </button>
              {BACKGROUND_PATTERNS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPattern(p)}
                  title={p.name}
                  aria-label={p.name}
                  className={cn(
                    "aspect-square rounded-lg border transition-transform hover:scale-105",
                    fields.background_color === p.css
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border",
                  )}
                  style={{ background: p.css }}
                />
              ))}
            </div>
          </div>

          {/* Foto de fundo */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">Foto de fundo</p>
            {fields.background_image ? (
              <div className="mt-3 space-y-2">
                <img
                  src={fields.background_image}
                  alt="Foto de fundo"
                  className="h-28 w-full rounded-lg object-cover"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ImageIcon className="size-4" />
                    )}
                    Trocar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => set("background_image", undefined)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="mt-3 w-full"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImageIcon className="size-4" />
                )}
                Enviar foto
              </Button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                void (isGuest
                  ? handleGuestImageFile(e.target.files?.[0])
                  : handleImageFile(e.target.files?.[0]))
              }
            />
            {uploadError ? (
              <p className="mt-2 text-xs text-destructive">{uploadError}</p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              {isGuest
                ? "JPG ou PNG até 5 MB. Fica salva no rascunho e é enviada automaticamente quando você publicar."
                : "JPG ou PNG até 5 MB. Vira o fundo do convite (com leve escurecimento para o texto ficar legível)."}
            </p>
            {fields.background_image ? (
              <PhotoAdjuster
                image={fields.background_image}
                position={fields.background_position || "50% 50%"}
                zoom={fields.background_zoom ?? 1}
                overlay={fields.background_overlay ?? 45}
                blur={fields.background_blur ?? 0}
                brightness={fields.background_brightness ?? 100}
                filter={fields.background_filter ?? "none"}
                accent={fields.primary_color ?? template.style.accentColor}
                onChange={patch}
              />
            ) : null}
          </div>

          {/* Cores */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">Cores</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ColorField
                label="Destaque"
                value={fields.primary_color ?? template.style.accentColor}
                isOverridden={fields.primary_color !== undefined}
                onChange={(v) => set("primary_color", v)}
                onReset={() => set("primary_color", undefined)}
              />
              <ColorField
                label="Fundo"
                value={fields.background_color ?? "#ffffff"}
                isOverridden={fields.background_color !== undefined}
                onChange={(v) => set("background_color", v)}
                onReset={() => set("background_color", undefined)}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Deixe em branco para usar as cores do template.
            </p>

            <div className="mt-4">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Cor do texto
              </p>
              <div className="inline-flex rounded-lg border border-border p-0.5 text-xs font-medium">
                {(
                  [
                    { v: undefined, label: "Auto" },
                    { v: "dark", label: "Escuro" },
                    { v: "light", label: "Claro" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => set("text_mode", opt.v)}
                    className={cn(
                      "rounded-md px-3 py-1 transition-colors",
                      fields.text_mode === opt.v
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Estilo & animação */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">✨ Estilo & animação</p>

            <p className="mb-1.5 mt-3 text-xs font-medium text-muted-foreground">
              Fonte do título
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() =>
                    set(
                      "font_family",
                      f.css === template.style.fontDisplay ? undefined : f.css,
                    )
                  }
                  style={{ fontFamily: f.css }}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-base transition-colors",
                    (fields.font_family ?? template.style.fontDisplay) === f.css
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <p className="mb-1.5 mt-4 text-xs font-medium text-muted-foreground">
              Tamanho do título
            </p>
            <div className="inline-flex rounded-lg border border-border p-0.5 text-xs font-medium">
              {(
                [
                  { v: "sm", label: "Pequeno" },
                  { v: undefined, label: "Médio" },
                  { v: "lg", label: "Grande" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => set("title_size", opt.v)}
                  className={cn(
                    "rounded-md px-3 py-1 transition-colors",
                    (fields.title_size ?? undefined) === opt.v
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p className="mb-1.5 mt-4 text-xs font-medium text-muted-foreground">
              Efeito de entrada
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { v: undefined, label: "Subir" },
                  { v: "fade", label: "Fade" },
                  { v: "zoom", label: "Zoom" },
                  { v: "down", label: "Descer" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => set("entrance", opt.v)}
                  className={cn(
                    "rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                    (fields.entrance ?? undefined) === opt.v
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Como chegar (mapa) */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">🗺️ Como chegar</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cole o link do local no Google Maps ou Waze. Se deixar vazio,
              geramos a busca a partir do endereço acima.
            </p>
            <Input
              className="mt-3"
              placeholder="https://maps.google.com/..."
              value={fields.maps_url ?? ""}
              onChange={(e) => set("maps_url", e.target.value || undefined)}
            />
          </div>

          {/* Música de fundo (player estilo Spotify) */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">🎵 Música de fundo</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Toca ao abrir o convite, num player estilo Spotify (capa + play +
              barra de progresso).
            </p>

            <div className="mt-3 space-y-2">
              <Input
                placeholder="Link do áudio (mp3/m4a)"
                value={fields.music_url ?? ""}
                onChange={(e) => set("music_url", e.target.value || undefined)}
              />
              {!isGuest ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={uploading}
                    onClick={() => audioFileRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Music className="size-4" />
                    )}
                    Enviar mp3
                  </Button>
                  <input
                    ref={audioFileRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => void handleAudioFile(e.target.files?.[0])}
                  />
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Enviar o arquivo de música libera ao criar a conta — por ora,
                  cole um link.
                </p>
              )}
            </div>

            {fields.music_url ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  {fields.music_cover ? (
                    <img
                      src={fields.music_cover}
                      alt=""
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Music className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={uploading}
                    onClick={() => coverRef.current?.click()}
                  >
                    <ImageIcon className="size-4" />
                    {fields.music_cover ? "Trocar capa" : "Capa da música"}
                  </Button>
                  {fields.music_cover ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => set("music_cover", undefined)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void handleCoverFile(e.target.files?.[0])}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Título da música"
                    value={fields.music_title ?? ""}
                    onChange={(e) =>
                      set("music_title", e.target.value || undefined)
                    }
                  />
                  <Input
                    placeholder="Artista"
                    value={fields.music_artist ?? ""}
                    onChange={(e) =>
                      set("music_artist", e.target.value || undefined)
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Presentes / PIX */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">🎁 Presentes / PIX</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Deixe um recado e sua chave PIX. Geramos QR Code + “copia e cola”
              no convite.
            </p>
            <div className="mt-3 space-y-3">
              <Textarea
                rows={2}
                maxLength={200}
                placeholder="Sua presença é o maior presente! Mas se quiser nos ajudar…"
                value={fields.gift_message ?? ""}
                onChange={(e) =>
                  set("gift_message", e.target.value || undefined)
                }
              />
              <Input
                placeholder="Chave PIX (e-mail, telefone, CPF ou aleatória)"
                value={fields.pix_key ?? ""}
                onChange={(e) => set("pix_key", e.target.value || undefined)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Nome do recebedor"
                  value={fields.pix_name ?? ""}
                  onChange={(e) => set("pix_name", e.target.value || undefined)}
                />
                <Input
                  placeholder="Cidade"
                  value={fields.pix_city ?? ""}
                  onChange={(e) => set("pix_city", e.target.value || undefined)}
                />
              </div>
              <Input
                placeholder="Link de lista de presentes (opcional)"
                value={fields.gift_url ?? ""}
                onChange={(e) => set("gift_url", e.target.value || undefined)}
              />

              {/* Lista de presentes (itens) */}
              <div className="rounded-lg border border-dashed border-border p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Lista de presentes
                </p>
                {fields.gift_items && fields.gift_items.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {fields.gift_items.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          className="flex-1"
                          placeholder="Ex: Jogo de panelas"
                          value={item.name}
                          onChange={(e) => {
                            const items = [...(fields.gift_items ?? [])]
                            items[i] = { ...items[i], name: e.target.value }
                            set("gift_items", items)
                          }}
                        />
                        <Input
                          className="w-24"
                          placeholder="R$ (opc)"
                          value={item.price ?? ""}
                          onChange={(e) => {
                            const items = [...(fields.gift_items ?? [])]
                            items[i] = {
                              ...items[i],
                              price: e.target.value || undefined,
                            }
                            set("gift_items", items)
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            set(
                              "gift_items",
                              (fields.gift_items ?? []).filter(
                                (_, j) => j !== i,
                              ),
                            )
                          }
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() =>
                    set("gift_items", [
                      ...(fields.gift_items ?? []),
                      { name: "" },
                    ])
                  }
                >
                  + Adicionar item
                </Button>
              </div>
            </div>
          </div>

          {/* Galeria de fotos */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">📸 Galeria de fotos</p>
            {isGuest ? (
              <p className="mt-2 text-xs text-muted-foreground">
                📷 A galeria libera quando você criar sua conta (na hora de
                publicar).
              </p>
            ) : (
              <>
                {fields.gallery && fields.gallery.length > 0 ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {fields.gallery.map((url) => (
                      <div key={url} className="group relative aspect-square">
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(url)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Remover foto"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  disabled={uploading}
                  onClick={() => galleryRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImageIcon className="size-4" />
                  )}
                  Adicionar foto
                </Button>
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void handleGalleryFile(e.target.files?.[0])}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Aparecem num carrossel no convite. JPG ou PNG até 5 MB cada.
                </p>
                {fields.gallery && fields.gallery.length > 0 ? (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Altura das fotos</span>
                      <span className="tabular-nums">
                        {fields.gallery_height ?? 128}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={220}
                      value={fields.gallery_height ?? 128}
                      onChange={(e) =>
                        set("gallery_height", Number(e.target.value))
                      }
                      className="h-1.5 w-full cursor-pointer"
                      style={{
                        accentColor:
                          fields.primary_color ?? template.style.accentColor,
                      }}
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Preview ao vivo */}
        <div className="flex items-start justify-center">
          <div
            className={cn(
              "overflow-hidden rounded-[2.2rem] border-8 border-foreground/80 bg-background shadow-2xl transition-all lg:sticky lg:top-24",
              device === "mobile"
                ? "h-[78vh] max-h-[820px] min-h-[600px] w-[380px] max-w-full"
                : "h-[74vh] max-h-[720px] min-h-[520px] w-full max-w-[960px] rounded-2xl",
            )}
          >
            <div className="h-full w-full overflow-y-auto">
              <InviteRenderer
                template={template}
                fields={fields}
                className="min-h-full"
              >
                {fields.gallery && fields.gallery.length > 0 ? (
                  <GalleryCarousel
                    images={fields.gallery}
                    height={fields.gallery_height ?? 128}
                  />
                ) : null}
              </InviteRenderer>
            </div>
          </div>
        </div>
      </div>

      {/* Prévia no mobile */}
      <Button
        size="lg"
        onClick={() => setShowPreview(true)}
        className="fixed bottom-5 right-5 z-30 shadow-xl lg:hidden"
      >
        <Eye className="size-4" />
        Prévia
      </Button>
      {showPreview ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-background lg:hidden">
          <div className="flex items-center justify-between border-b border-border p-3">
            <span className="font-semibold">Prévia do convite</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(false)}
              aria-label="Fechar"
            >
              <X className="size-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <InviteRenderer
              template={template}
              fields={fields}
              className="min-h-full"
            >
              {fields.gallery && fields.gallery.length > 0 ? (
                <GalleryCarousel
                  images={fields.gallery}
                  height={fields.gallery_height ?? 128}
                />
              ) : null}
            </InviteRenderer>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return <span className="flex-1" />
  return (
    <span className="flex flex-1 items-center justify-center gap-1.5 text-xs text-muted-foreground">
      {status === "saving" ? (
        <>
          <Cloud className="size-3.5 animate-pulse" />
          Salvando...
        </>
      ) : (
        <>
          <Check className="size-3.5 text-emerald-600" />
          Salvo
        </>
      )}
    </span>
  )
}

function DeviceButton({
  active,
  onClick,
  icon,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
    </button>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {hint ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function ColorField({
  label,
  value,
  isOverridden,
  onChange,
  onReset,
}: {
  label: string
  value: string
  isOverridden: boolean
  onChange: (v: string) => void
  onReset: () => void
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 cursor-pointer rounded-md border border-border bg-transparent"
          aria-label={label}
        />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      {isOverridden ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-1 text-[11px] text-primary hover:underline"
        >
          resetar
        </button>
      ) : null}
    </div>
  )
}
