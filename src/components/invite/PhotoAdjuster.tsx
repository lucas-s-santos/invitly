import { useRef } from "react"

/** Ajuste da foto de fundo: arrastar p/ enquadrar + zoom + escurecimento. */
export function PhotoAdjuster({
  image,
  position,
  zoom,
  overlay,
  accent,
  onChange,
}: {
  image: string
  position: string
  zoom: number
  overlay: number
  accent?: string
  onChange: (patch: {
    background_position?: string
    background_zoom?: number
    background_overlay?: number
  }) => void
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
          style={{ objectPosition: position, transform: `scale(${zoom})` }}
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
