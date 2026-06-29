import { useMemo } from "react"
import type { CSSProperties } from "react"

interface FallingParticlesProps {
  emojis: string[]
  count?: number
  /** opacidade base das partículas */
  opacity?: number
}

export function FallingParticles({
  emojis,
  count = 18,
  opacity = 0.9,
}: FallingParticlesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: emojis[i % emojis.length],
        left: Math.random() * 100,
        size: 14 + Math.random() * 16,
        duration: 7 + Math.random() * 6,
        delay: -Math.random() * 12,
        sway: Math.random() * 80 - 40,
        spin: 180 + Math.random() * 360,
      })),
    [emojis, count],
  )

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="invitly-fall"
          style={
            {
              left: `${p.left}%`,
              fontSize: `${p.size}px`,
              opacity,
              "--duration": `${p.duration}s`,
              "--delay": `${p.delay}s`,
              "--sway": `${p.sway}px`,
              "--spin": `${p.spin}deg`,
            } as CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
