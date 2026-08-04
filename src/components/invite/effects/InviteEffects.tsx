import type { InviteFields, Template } from "@/types"
import { Confetti } from "./Confetti"
import { FallingParticles } from "./FallingParticles"

const PARTICLE_MAP: Record<
  string,
  { emojis: string[]; count?: number; opacity?: number }
> = {
  petals: { emojis: ["🌸", "🤍", "🌷"], count: 16, opacity: 0.9 },
  snow: { emojis: ["❄️", "•"], count: 26, opacity: 0.85 },
  bats: { emojis: ["🦇"], count: 12, opacity: 0.8 },
}

const PARTICLE_TYPES = ["petals", "snow", "bats"] as const

/** O que voa pra cima quando o convite não é de confete. */
const BURST_MAP: Record<string, string[]> = {
  petals: ["🌸", "🤍", "🌷"],
  snow: ["❄️", "🎄", "⭐"],
  bats: ["🦇", "🎃", "👻"],
}

export function InviteEffects({
  template,
  fields,
  replayKey = 0,
}: {
  template: Template
  /** campos do convite — cores e emoji escolhidos pela pessoa */
  fields?: InviteFields
  replayKey?: number
}) {
  const types = new Set(template.animations.map((a) => a.type))
  const particleType = PARTICLE_TYPES.find((t) => types.has(t))
  const particle = particleType ? PARTICLE_MAP[particleType] : null

  const style = template.style
  const accent = fields?.primary_color || style.accentColor
  const text = fields?.text_color || style.textColor
  // paleta do convite: destaque + tons dele + a cor do texto
  const colors = [
    accent,
    mix(accent, "#ffffff", 0.35),
    mix(accent, "#000000", 0.25),
    text,
    "#ffd700",
  ]

  // emoji do convite (o mesmo da capa) como último recurso
  const motif = fields?.motif !== undefined ? fields.motif : style.motif
  const burst = particleType
    ? BURST_MAP[particleType]
    : motif?.trim()
      ? [motif.trim()]
      : ["✨"]

  return (
    <>
      {types.has("confetti") ? (
        <Confetti trigger={replayKey} colors={colors} />
      ) : (
        <Confetti trigger={replayKey} emojis={burst} />
      )}
      {particle ? (
        <FallingParticles
          emojis={particle.emojis}
          count={particle.count}
          opacity={particle.opacity}
        />
      ) : null}
    </>
  )
}

/** Mistura dois hex (#rgb ou #rrggbb). `amount` = quanto puxar p/ `target`. */
function mix(hex: string, target: string, amount: number): string {
  const rgb = (h: string) => {
    const c = h.replace("#", "")
    const full = c.length === 3 ? c.replace(/(.)/g, "$1$1") : c
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ]
  }
  const a = rgb(hex)
  const b = rgb(target)
  if ([...a, ...b].some(Number.isNaN)) return hex
  const out = a.map((v, i) =>
    Math.round(v + (b[i] - v) * amount)
      .toString(16)
      .padStart(2, "0"),
  )
  return `#${out.join("")}`
}
