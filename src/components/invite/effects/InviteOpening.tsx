import { useState } from "react"

interface InviteOpeningProps {
  title: string
  background: string
  accentColor: string
  /** Emoji do convite (o mesmo escolhido no editor). */
  motif?: string
  onOpen: () => void
}

/** Duração total da abertura (emoji + cortinas), em ms. */
const OPEN_MS = 1200

/**
 * Tela de abertura: o emoji do convite flutua, cresce ao toque e as cortinas
 * se afastam revelando o convite.
 */
export function InviteOpening({
  title,
  background,
  accentColor,
  motif,
  onOpen,
}: InviteOpeningProps) {
  const [opening, setOpening] = useState(false)
  const emoji = motif?.trim() ? motif : "💌"

  function open() {
    if (opening) return
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    setOpening(true)
    window.setTimeout(onOpen, reduced ? 250 : OPEN_MS)
  }

  const t = (ms: number, delay: number) => ({
    transition: `transform ${ms}ms cubic-bezier(0.7,0,0.3,1) ${delay}ms, opacity ${ms}ms ease ${delay}ms`,
  })

  return (
    <div
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden"
      onClick={open}
      role="button"
      aria-label="Abrir convite"
    >
      {/* Cortinas */}
      <div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{
          background,
          transform: opening ? "translateX(-100%)" : "none",
          ...t(750, opening ? 400 : 0),
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{
          background,
          transform: opening ? "translateX(100%)" : "none",
          ...t(750, opening ? 400 : 0),
        }}
      />

      {/* Emoji do convite + chamada */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center text-white">
        <div className="relative flex items-center justify-center">
          {/* brilho atrás do emoji */}
          <span
            aria-hidden
            className="absolute size-40 rounded-full blur-2xl"
            style={{
              backgroundColor: accentColor,
              opacity: opening ? 0 : 0.35,
              transform: opening ? "scale(1.6)" : "none",
              ...t(500, 0),
            }}
          />
          <span
            className="relative text-[92px] leading-none drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] select-none sm:text-[110px]"
            style={{
              animation: opening
                ? undefined
                : "invitly-flutter 3s ease-in-out infinite",
              transform: opening ? "scale(1.9)" : "none",
              opacity: opening ? 0 : 1,
              ...t(600, 0),
            }}
          >
            {emoji}
          </span>
        </div>

        <p
          className="font-display text-2xl font-bold sm:text-3xl"
          style={{
            textShadow: "0 2px 16px rgba(0,0,0,0.45)",
            opacity: opening ? 0 : 1,
            transform: opening ? "translateY(10px)" : "none",
            ...t(350, 0),
          }}
        >
          {title}
        </p>
        <span
          className="rounded-full px-6 py-2.5 text-sm font-bold shadow-lg"
          style={{
            backgroundColor: accentColor,
            color: "#1a0533",
            opacity: opening ? 0 : 1,
            transform: opening ? "translateY(10px)" : "none",
            ...t(300, 0),
          }}
        >
          Toque para abrir
        </span>
      </div>
    </div>
  )
}
