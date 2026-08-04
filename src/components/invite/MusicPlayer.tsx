import { useEffect, useRef, useState } from "react"
import { Music, Pause, Play, Volume1, Volume2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Volume inicial: sempre o mínimo audível. Ninguém leva susto ao abrir o
 * convite — quem quiser ouvir mais alto sobe no slider.
 */
const DEFAULT_VOLUME = 0.05
/** Tempo do fade-in ao abrir o convite (ms) — entra sem estalo. */
const FADE_AUTOPLAY_MS = 1800
/** Fade mais curto quando a pessoa aperta o play. */
const FADE_MANUAL_MS = 600

/**
 * Player de música do convite. Começa a tocar quando `active` vira true
 * (o gesto de abrir o convite libera o autoplay), sempre no volume mínimo
 * e subindo do zero aos poucos para não assustar quem abre o convite.
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
  const fadeRef = useRef<number | null>(null)
  const volumeRef = useRef(DEFAULT_VOLUME)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)

  const minimal = !title?.trim() && !artist?.trim()

  function stopFade() {
    if (fadeRef.current !== null) {
      window.clearInterval(fadeRef.current)
      fadeRef.current = null
    }
  }

  /** Sobe o volume de 0 até o alvo aos poucos. */
  function fadeIn(el: HTMLAudioElement, ms: number) {
    stopFade()
    const step = 60
    let elapsed = 0
    el.volume = 0
    fadeRef.current = window.setInterval(() => {
      elapsed += step
      const target = volumeRef.current
      el.volume = Math.min(target, (elapsed / ms) * target)
      if (elapsed >= ms) stopFade()
    }, step)
  }

  function playWithFade(el: HTMLAudioElement, ms: number) {
    el.volume = 0
    el.play()
      .then(() => {
        setPlaying(true)
        fadeIn(el, ms)
      })
      .catch(() => setPlaying(false))
  }

  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return
    playWithFade(el, FADE_AUTOPLAY_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => stopFade, [])

  /** Slider do volume: corta o fade e aplica na hora. */
  function changeVolume(v: number) {
    volumeRef.current = v
    setVolume(v)
    stopFade()
    if (ref.current) ref.current.volume = v
  }

  function toggle() {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      playWithFade(el, FADE_MANUAL_MS)
    } else {
      stopFade()
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
          onChange={(e) => changeVolume(Number(e.target.value))}
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
        {/* volume: começa no mínimo, quem quiser sobe aqui */}
        <div className="mt-1 flex items-center gap-1.5">
          {volume < 0.5 ? (
            <Volume1 className="size-3.5 shrink-0 text-white/70" aria-hidden />
          ) : (
            <Volume2 className="size-3.5 shrink-0 text-white/70" aria-hidden />
          )}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volume"
            className="h-1 flex-1 cursor-pointer"
            style={{ accentColor: accent }}
          />
        </div>
      </div>

      {playButton}
    </div>
  )
}
