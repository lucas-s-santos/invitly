import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
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
  Rocket,
  Smartphone,
  Trash2,
  Users,
  X,
} from "lucide-react"

import { toast } from "sonner"

import { useInvite, usePublishInvite, useUpdateInvite } from "@/hooks/useInvites"
import { getTemplate } from "@/lib/templates"
import { uploadInviteImage } from "@/lib/storage"
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

type SaveStatus = "idle" | "saving" | "saved"

export default function Editor() {
  const { id } = useParams()
  const { data: invite, isLoading, isError } = useInvite(id)
  const update = useUpdateInvite()
  const publish = usePublishInvite()

  const [fields, setFields] = useState<InviteFields | null>(null)
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile")
  const [showPreview, setShowPreview] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const dirtyRef = useRef(false)
  const initRef = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Inicializa o formulário quando o convite carrega
  useEffect(() => {
    if (invite && !initRef.current) {
      setFields(invite.data as InviteFields)
      initRef.current = true
    }
  }, [invite])

  // Auto-save com debounce (1.2s após a última edição)
  useEffect(() => {
    if (!fields || !id || !dirtyRef.current) return
    setSaveStatus("saving")
    const timeout = setTimeout(() => {
      update.mutate(
        { id, title: fields.title, fields },
        {
          onSuccess: () => {
            dirtyRef.current = false
            setSaveStatus("saved")
          },
        },
      )
    }, 1200)
    return () => clearTimeout(timeout)
    // update é estável (referência do mutation); não incluir para evitar loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, id])

  const template = invite ? getTemplate(invite.template_id) : undefined

  if (isLoading) return <FullScreenLoader />
  if (isError || !invite) {
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

  const isPublished = invite.status === "published"
  const publicUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/convite/${invite.slug}`

  function set<K extends keyof InviteFields>(key: K, value: InviteFields[K]) {
    dirtyRef.current = true
    setFields((prev) => (prev ? { ...prev, [key]: value } : prev))
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

  function handlePublish() {
    if (!invite || !fields) return
    const missing: string[] = []
    if (!fields.title.trim()) missing.push("título")
    if (!fields.event_date) missing.push("data do evento")
    if (missing.length > 0) {
      toast.error(`Preencha ${missing.join(" e ")} antes de publicar.`)
      return
    }
    publish.mutate(invite.id, {
      onSuccess: () =>
        toast.success("Convite publicado! 🎉 Já pode compartilhar."),
      onError: () => toast.error("Não foi possível publicar. Tente de novo."),
    })
  }

  return (
    <div className="flex min-h-svh flex-col bg-secondary/40">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
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
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={publish.isPending}
              >
                {publish.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Rocket className="size-4" />
                )}
                Publicar
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_1fr]">
        {/* Painel de propriedades */}
        <div className="space-y-5">
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
                  <Link to={`/convite/${invite.slug}/lista`}>
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
              onChange={(e) => void handleImageFile(e.target.files?.[0])}
            />
            {uploadError ? (
              <p className="mt-2 text-xs text-destructive">{uploadError}</p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              JPG ou PNG até 5 MB. Vira o fundo do convite (com leve
              escurecimento para o texto ficar legível).
            </p>
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
        </div>

        {/* Preview ao vivo */}
        <div className="flex items-start justify-center">
          <div
            className={cn(
              "overflow-hidden rounded-[2rem] border-8 border-foreground/80 bg-background shadow-2xl transition-all",
              device === "mobile"
                ? "h-[640px] w-[320px]"
                : "h-[560px] w-full max-w-[820px] rounded-2xl",
            )}
          >
            <div className="h-full w-full overflow-y-auto">
              <InviteRenderer template={template} fields={fields} />
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
            />
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
