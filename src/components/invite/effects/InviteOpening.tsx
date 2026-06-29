import { useState } from "react"

import { cn } from "@/lib/utils"

interface InviteOpeningProps {
  title: string
  background: string
  accentColor: string
  motif?: string
  onOpen: () => void
}

export function InviteOpening({
  title,
  background,
  accentColor,
  motif,
  onOpen,
}: InviteOpeningProps) {
  const [opening, setOpening] = useState(false)

  function open() {
    if (opening) return
    setOpening(true)
    window.setTimeout(onOpen, 900)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden"
      onClick={open}
      role="button"
      aria-label="Abrir convite"
    >
      {/* Cortina esquerda */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 transition-transform duration-[900ms] ease-[cubic-bezier(0.7,0,0.3,1)]"
        style={{ background, transform: opening ? "translateX(-100%)" : "none" }}
      />
      {/* Cortina direita */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 transition-transform duration-[900ms] ease-[cubic-bezier(0.7,0,0.3,1)]"
        style={{ background, transform: opening ? "translateX(100%)" : "none" }}
      />

      {/* Convite (chamada para abrir) */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-center gap-5 px-6 text-center text-white transition-all duration-500",
          opening && "scale-90 opacity-0",
        )}
      >
        <div className="text-6xl drop-shadow-lg [animation:invitly-flutter_2.4s_ease-in-out_infinite]">
          {motif ?? "💌"}
        </div>
        <p
          className="font-display text-2xl font-bold sm:text-3xl"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.45)" }}
        >
          {title}
        </p>
        <span
          className="rounded-full px-6 py-2.5 text-sm font-bold shadow-lg"
          style={{ backgroundColor: accentColor, color: "#1a0533" }}
        >
          Toque para abrir
        </span>
      </div>
    </div>
  )
}
