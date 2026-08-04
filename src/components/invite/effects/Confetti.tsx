import { useEffect } from "react"
import confetti from "canvas-confetti"

interface ConfettiProps {
  colors?: string[]
  /**
   * Se informado, atira estes emojis em vez de papel picado — para convites
   * em que confete não combina (casamento, natal, halloween, corporativo...).
   */
  emojis?: string[]
  /** mude este valor para refazer o efeito */
  trigger?: number
}

export function Confetti({ colors, emojis, trigger = 0 }: ConfettiProps) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const list = (emojis ?? []).filter((e) => e.trim())
    const shapes = list.length
      ? list.map((text) => confetti.shapeFromText({ text, scalar: 2.4 }))
      : undefined

    const defaults = {
      spread: 70,
      ticks: 220,
      gravity: 1,
      decay: 0.92,
      startVelocity: 32,
      colors,
      disableForReducedMotion: true,
      ...(shapes ? { shapes, scalar: 2.4, flat: true } : {}),
    }
    // emoji é bem maior que o papel picado: menos peças, senão polui
    const n = shapes ? 0.4 : 1

    void confetti({
      ...defaults,
      particleCount: Math.round(55 * n),
      origin: { x: 0.2, y: 0.75 },
    })
    void confetti({
      ...defaults,
      particleCount: Math.round(55 * n),
      origin: { x: 0.8, y: 0.75 },
    })
    const t = setTimeout(() => {
      void confetti({
        ...defaults,
        particleCount: Math.round(90 * n),
        spread: 110,
        origin: { x: 0.5, y: 0.6 },
      })
    }, 250)

    return () => clearTimeout(t)
    // refaz só quando `trigger` muda (cores/emojis são estáveis no convite)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return null
}
