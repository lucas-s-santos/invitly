import { useEffect, useRef, useState } from "react"

import type { Template } from "@/types"
import { InviteRenderer } from "./InviteRenderer"

const BASE_W = 300
const BASE_H = 400

/**
 * Miniatura real do template: renderiza o convite em tamanho fixo e escala
 * para caber na largura do container (responsivo via ResizeObserver).
 */
export function TemplatePreview({
  template,
  className,
}: {
  template: Template
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.6)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(el.clientWidth / BASE_W)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        aspectRatio: `${BASE_W} / ${BASE_H}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: BASE_W, height: BASE_H, transform: `scale(${scale})` }}
      >
        <InviteRenderer
          template={template}
          fields={template.defaultData}
          preview
          className="h-full"
        />
      </div>
    </div>
  )
}
