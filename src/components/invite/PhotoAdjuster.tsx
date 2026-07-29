import { useRef } from "react"

import { cn } from "@/lib/utils"
import type { InviteFields } from "@/types"

type Filter = NonNullable<InviteFields["background_filter"]>

const FILTERS: { id: Filter; label: string }[] = [
  { id: "none", label: "Nenhum" },
  { id: "bw", label: "P&B" },
  { id: "sepia", label: "Sépia" },
  { id: "vintage", label: "Vintage" },
]

const POSITIONS: { label: string; value: string }[] = [
  { label: "Topo", value: "50% 0%" },
  { label: "Centro", value: "50% 50%" },
  { label: "Baixo", value: "50% 100%" },
]

function filterCss(filter: Filter): string {
  if (filter === "bw") return "grayscale(1)"
  if (filter === "sepia") return "sepia(0.75)"
  if (filter === "vintage") return "sepia(0.4) contrast(1.05) saturate(1.35)"
  return ""
}

/** Ajuste da foto de fundo: enquadrar (arrastar/presets) + zoom + escurecer + blur + brilho + filtro. */
export function PhotoAdjuster({
  image,
  position,
  zoom,
  overlay,
  blur,
  brightness,
  filter,
  accent,
  onChange,
}: {
  image: string
  position: string
  zoom: number
  overlay: number
  blur: number
  brightness: number
  filter: Filter
  accent?: string
  onChange: (patch: Partial<InviteFields>) => void
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  function setFromEvent(clientX: number, clientY: number) {
    const el = boxRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100))
    const y = Math.min(100, Math.max(0, ((clientY - r.top) / r.height) * 100))
    onChange({ background_position: `${Math.round(x)}% ${Math.round(y)}%` })
  }

  const previewFilter =
    [
      blur ? `blur(${blur}px)` : "",
      brightness != null ? `brightness(${brightness}%)` : "",
      filterCss(filter),
    ]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    <div className="mt-3 space-y-3">
      <div
        ref={boxRef}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture?.(e.pointerId)
          setFromEvent(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromEvent(e.clientX, e.clientY)
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
        className="relative h-32 w-full cursor-move touch-none overflow-hidden rounded-lg border border-border"
      >
        <img
          src={image}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: position,
            transform: `scale(${Math.max(zoom, blur ? 1.06 : 1)})`,
            filter: previewFilter,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlay / 100})` }}
        />
        <span className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white">
          arraste para enquadrar
        </span>
      </div>

      {/* Enquadramento rápido */}
      <div className="flex gap-2">
        {POSITIONS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange({ background_position: p.value })}
            className={cn(
              "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
              position === p.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Slider
        label="Zoom"
        min={100}
        max={300}
        value={Math.round(zoom * 100)}
        suffix="%"
        accent={accent}
        onChange={(v) => onChange({ background_zoom: v / 100 })}
      />
      <Slider
        label="Escurecer"
        min={0}
        max={90}
        value={overlay}
        suffix="%"
        accent={accent}
        onChange={(v) => onChange({ background_overlay: v })}
      />
      <Slider
        label="Desfoque"
        min={0}
        max={20}
        value={blur}
        suffix="px"
        accent={accent}
        onChange={(v) => onChange({ background_blur: v || undefined })}
      />
      <Slider
        label="Brilho"
        min={50}
        max={150}
        value={brightness}
        suffix="%"
        accent={accent}
        onChange={(v) => onChange({ background_brightness: v === 100 ? undefined : v })}
      />

      {/* Filtro artístico */}
      <div>
        <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          Filtro
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
            ⭐ Premium
          </span>
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() =>
                onChange({
                  background_filter: f.id === "none" ? undefined : f.id,
                })
              }
              className={cn(
                "rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                (filter || "none") === f.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Slider({
  label,
  min,
  max,
  value,
  suffix,
  accent,
  onChange,
}: {
  label: string
  min: number
  max: number
  value: number
  suffix?: string
  accent?: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer"
        style={{ accentColor: accent || "#ff6b9d" }}
      />
    </div>
  )
}
