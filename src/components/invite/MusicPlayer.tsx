import { useEffect, useRef, useState } from "react"
import { Music, Pause, Play } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Player estilo Spotify embutido no convite: capa (girando), título, artista,
 * play/pause e barra de progresso. Começa a tocar quando `active` vira true
 * (o gesto de abrir o convite libera o autoplay).
 */
export function MusicPlayer({
  active,
  url,
  title,
  artist,
  cover,
  accent = "#ff6b9d",
}: {
  active: boolean
  url: string
  title?: string
  artist?: string
  cover?: string
  accent?: string
}) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return
    el.volume = 0.6
    el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }, [active])

  function toggle() {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  function onTime() {
    const el = ref.current
    if (!el || !el.duration) return
    setProgress(el.currentTime / el.duration)
  }

  function seek(value: number) {
    const el = ref.current
    if (!el || !el.duration) return
    el.currentTime = value * el.duration
    setProgress(value)
  }

  return (
    <div className="fixed left-1/2 top-3 z-30 w-[min(92vw,340px)] -translate-x-1/2">
      <audio
        ref={ref}
        src={url}
        loop
        preload="auto"
        onTimeUpdate={onTime}
        onLoadedMetadata={onTime}
      />
      <div className="flex items-center gap-3 rounded-2xl bg-black/55 p-2 pr-3 text-white shadow-lg backdrop-blur-md">
        {cover ? (
          <img
            src={cover}
            alt=""
            className={cn(
              "size-11 shrink-0 rounded-full object-cover",
              playing && "animate-[spin_6s_linear_infinite]",
            )}
          />
        ) : (
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full",
              playing && "animate-[spin_6s_linear_infinite]",
            )}
            style={{ backgroundColor: accent }}
          >
            <Music className="size-5 text-white" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">
            {title || "Nossa música"}
          </p>
          <p className="truncate text-xs text-white/70">
            {artist || "tocando agora"}
          </p>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Progresso da música"
            className="mt-1.5 h-1 w-full cursor-pointer"
            style={{ accentColor: accent }}
          />
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar" : "Tocar"}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
        >
          {playing ? (
            <Pause className="size-4 fill-current" />
          ) : (
            <Play className="size-4 translate-x-px fill-current" />
          )}
        </button>
      </div>
    </div>
  )
}
