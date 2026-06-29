import type { Template } from "@/types"
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

export function InviteEffects({
  template,
  replayKey = 0,
}: {
  template: Template
  replayKey?: number
}) {
  const types = new Set(template.animations.map((a) => a.type))
  const particleType = PARTICLE_TYPES.find((t) => types.has(t))
  const particle = particleType ? PARTICLE_MAP[particleType] : null

  return (
    <>
      {types.has("confetti") ? (
        <Confetti
          trigger={replayKey}
          colors={[
            template.style.accentColor,
            template.style.textColor,
            "#ffd700",
          ]}
        />
      ) : null}
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
