import { useEffect } from "react"
import confetti from "canvas-confetti"

interface ConfettiProps {
  colors?: string[]
  /** mude este valor para refazer o efeito */
  trigger?: number
}

export function Confetti({ colors, trigger = 0 }: ConfettiProps) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const defaults = {
      spread: 70,
      ticks: 220,
      gravity: 1,
      decay: 0.92,
      startVelocity: 32,
      colors,
      disableForReducedMotion: true,
    }

    void confetti({ ...defaults, particleCount: 55, origin: { x: 0.2, y: 0.75 } })
    void confetti({ ...defaults, particleCount: 55, origin: { x: 0.8, y: 0.75 } })
    const t = setTimeout(() => {
      void confetti({
        ...defaults,
        particleCount: 90,
        spread: 110,
        origin: { x: 0.5, y: 0.6 },
      })
    }, 250)

    return () => clearTimeout(t)
    // refaz só quando `trigger` muda (cores são estáveis por template)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return null
}
