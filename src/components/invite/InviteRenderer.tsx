import type { CSSProperties } from "react"

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
}

export function InviteRenderer({
  template,
  fields,
  animate = false,
  preview = false,
  className,
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

  const anim = animate
    ? "animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700"
    : ""
  const delay = (ms: number): CSSProperties =>
    animate ? { animationDelay: `${ms}ms` } : {}

  return (
    <div
      className={cn(
        "relative flex h-full min-h-full w-full flex-col items-center justify-center overflow-hidden px-8 py-12 text-center",
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
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.6))",
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
        className="relative flex max-w-md flex-col items-center gap-5"
        style={bgImage ? { textShadow: "0 1px 14px rgba(0,0,0,0.55)" } : undefined}
      >
        {style.motif ? (
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
            "text-4xl leading-tight font-bold sm:text-5xl",
            anim,
            hasFlicker && "invitly-flicker",
          )}
          style={{ fontFamily: style.fontDisplay, ...delay(200) }}
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
            className={cn("text-base leading-relaxed italic opacity-90", anim)}
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
    </div>
  )
}
