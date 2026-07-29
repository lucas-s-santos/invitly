import type { CSSProperties, ReactNode } from "react"

import type { InviteFields, Template } from "@/types"
import { formatLongDate, parseEventDate } from "@/lib/date"
import { cn } from "@/lib/utils"
import { Countdown } from "./Countdown"
import { Typewriter } from "./effects/Typewriter"

interface InviteRendererProps {
  template: Template
  fields: InviteFields
  /** ativa as animações de entrada (página pública) */
  animate?: boolean
  /** modo miniatura: desativa o countdown ao vivo (evita timers em grades) */
  preview?: boolean
  className?: string
  /** conteúdo extra renderizado abaixo da mensagem, no mesmo fundo (ex: fotos/música) */
  children?: ReactNode
}

export function InviteRenderer({
  template,
  fields,
  animate = false,
  preview = false,
  className,
  children,
}: InviteRendererProps) {
  const style = template.style
  const accent = fields.primary_color || style.accentColor
  const background = fields.background_color || style.background
  const eventDate = parseEventDate(fields.event_date, fields.event_time)
  const showCountdown =
    !preview && eventDate ? eventDate.getTime() > Date.now() : false

  const animTypes = new Set(template.animations.map((a) => a.type))
  const hasTypewriter = animate && animTypes.has("typewriter")
  const hasFlicker = animTypes.has("flicker")

  const bgImage = fields.background_image
  const textColor = bgImage
    ? "#ffffff"
    : fields.text_mode === "light"
      ? "#ffffff"
      : fields.text_mode === "dark"
        ? "#1a0533"
        : style.textColor
  const mutedColor = bgImage
    ? "rgba(255,255,255,0.8)"
    : fields.text_mode === "light"
      ? "rgba(255,255,255,0.72)"
      : fields.text_mode === "dark"
        ? "rgba(26,5,51,0.6)"
        : style.mutedColor

  const entranceMap = {
    fade: "animate-in fade-in fill-mode-both duration-700",
    up: "animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700",
    down: "animate-in fade-in slide-in-from-top-3 fill-mode-both duration-700",
    zoom: "animate-in fade-in zoom-in-95 fill-mode-both duration-700",
  } as const
  const anim = animate ? entranceMap[fields.entrance ?? "up"] : ""
  const delay = (ms: number): CSSProperties =>
    animate ? { animationDelay: `${ms}ms` } : {}

  // Filtros da foto de fundo (blur + brilho + filtro artístico)
  const filterCss =
    fields.background_filter === "bw"
      ? "grayscale(1)"
      : fields.background_filter === "sepia"
        ? "sepia(0.75)"
        : fields.background_filter === "vintage"
          ? "sepia(0.4) contrast(1.05) saturate(1.35)"
          : ""
  const bgFilter =
    [
      fields.background_blur ? `blur(${fields.background_blur}px)` : "",
      fields.background_brightness != null
        ? `brightness(${fields.background_brightness}%)`
        : "",
      filterCss,
    ]
      .filter(Boolean)
      .join(" ") || undefined
  const bgScale = Math.max(
    fields.background_zoom ?? 1,
    fields.background_blur ? 1.06 : 1,
  )

  // Tamanho do título
  const titleSize = preview
    ? "text-3xl"
    : fields.title_size === "sm"
      ? "text-3xl sm:text-4xl"
      : fields.title_size === "lg"
        ? "text-5xl sm:text-6xl"
        : "text-4xl sm:text-5xl"

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden text-center",
        preview ? "px-6 py-8" : "px-8 py-12",
        className,
      )}
      style={{ background, color: textColor }}
    >
      {bgImage ? (
        <>
          <img
            src={bgImage}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: fields.background_position || "50% 50%",
              transform: `scale(${bgScale})`,
              filter: bgFilter,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundColor: `rgba(0,0,0,${(fields.background_overlay ?? 45) / 100})`,
            }}
          />
        </>
      ) : style.motif ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-6 right-6 text-[120px] leading-none opacity-10 select-none"
        >
          {style.motif}
        </div>
      ) : null}

      <div
        className={cn(
          "relative flex w-full max-w-md flex-col items-center",
          preview ? "gap-3" : "gap-5",
        )}
        style={bgImage ? { textShadow: "0 1px 14px rgba(0,0,0,0.55)" } : undefined}
      >
        {style.motif && !preview ? (
          <div className={cn("text-4xl", anim)} style={delay(0)} aria-hidden>
            {style.motif}
          </div>
        ) : null}

        {fields.hosts ? (
          <p
            className={cn(
              "text-xs font-semibold tracking-[0.25em] uppercase",
              anim,
            )}
            style={{ color: accent, ...delay(100) }}
          >
            {fields.hosts}
          </p>
        ) : null}

        <h1
          className={cn(
            "leading-tight font-bold break-words hyphens-auto",
            titleSize,
            anim,
            hasFlicker && "invitly-flicker",
          )}
          lang="pt-BR"
          style={{
            fontFamily: fields.font_family || style.fontDisplay,
            ...delay(200),
          }}
        >
          {hasTypewriter ? <Typewriter text={fields.title} /> : fields.title}
        </h1>

        {fields.event_date ? (
          <p
            className={cn("text-lg font-medium", anim)}
            style={{ color: accent, ...delay(300) }}
          >
            {formatLongDate(fields.event_date)}
            {fields.event_time ? ` · ${fields.event_time}` : ""}
          </p>
        ) : null}

        {fields.location ? (
          <p
            className={cn("text-sm", anim)}
            style={{ color: mutedColor, ...delay(350) }}
          >
            {fields.location}
          </p>
        ) : null}

        <span
          aria-hidden
          className={cn("my-1 block h-px w-12", anim)}
          style={{ backgroundColor: accent, ...delay(400) }}
        />

        {fields.message ? (
          <p
            className={cn(
              "leading-relaxed italic opacity-90",
              preview ? "line-clamp-3 text-sm" : "text-base",
              anim,
            )}
            style={delay(450)}
          >
            {fields.message}
          </p>
        ) : null}

        {showCountdown && eventDate ? (
          <div className={cn("mt-4", anim)} style={delay(550)}>
            <Countdown
              target={eventDate}
              accentColor={accent}
              mutedColor={mutedColor}
            />
          </div>
        ) : null}
      </div>

      {children ? (
        <div className="relative z-[1] mt-9 w-full max-w-lg">{children}</div>
      ) : null}
    </div>
  )
}
