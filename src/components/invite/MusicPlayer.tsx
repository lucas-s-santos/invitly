import { useEffect, useRef, useState } from "react"
import { Music, Pause, Play, Volume1, Volume2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Player de música do convite. Começa a tocar quando `active` vira true
 * (o gesto de abrir o convite libera o autoplay).
 *
 * - Com título/artista: card estilo Spotify (capa girando + info + progresso).
 * - Sem título nem artista: modo minimalista e elegante — só play/pause e volume,
 *   sem nenhuma escrita.
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
  const [volume, setVolume] = useState(0.6)

  const minimal = !title?.trim() && !artist?.trim()

  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return
    el.volume = volume
    el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => {
    const el = ref.current
    if (el) el.volume = volume
  }, [volume])

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

  const audio = (
    <audio
      ref={ref}
      src={url}
      loop
      preload="auto"
      onTimeUpdate={onTime}
      onLoadedMetadata={onTime}
    />
  )

  const playButton = (
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
  )

  if (minimal) {
    return (
      <div className="mx-auto flex w-fit items-center gap-3 rounded-full bg-black/45 px-3 py-2 text-white shadow-lg backdrop-blur-md">
        {audio}
        {playButton}
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full",
            playing && "animate-[spin_5s_linear_infinite]",
          )}
          style={{ backgroundColor: accent }}
          aria-hidden
        >
          <Music className="size-3.5 text-white" />
        </div>
        {volume < 0.5 ? (
          <Volume1 className="size-4 shrink-0 text-white/70" aria-hidden />
        ) : (
          <Volume2 className="size-4 shrink-0 text-white/70" aria-hidden />
        )}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
          className="h-1 w-24 cursor-pointer"
          style={{ accentColor: accent }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-black/50 p-2 pr-3 text-white shadow-lg backdrop-blur-md">
      {audio}
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
        <p className="truncate text-xs text-white/70">{artist}</p>
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

      {playButton}
    </div>
  )
}
