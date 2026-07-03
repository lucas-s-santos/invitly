import { useEffect, useRef, useState } from "react"

import type { InviteFields, Template } from "@/types"
import { InviteRenderer } from "./InviteRenderer"

/**
 * Miniatura real do template: renderiza o convite num tamanho-base fixo e escala
 * para caber na largura do container (responsivo via ResizeObserver), mantendo
 * o texto proporcional. `baseW`/`baseH` controlam o formato; `fields` permite
 * sobrescrever os dados (ex: foto de fundo).
 */
export function TemplatePreview({
  template,
  fields,
  className,
  baseW = 300,
  baseH = 400,
}: {
  template: Template
  fields?: InviteFields
  className?: string
  baseW?: number
  baseH?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.6)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(el.clientWidth / baseW)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [baseW])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        aspectRatio: `${baseW} / ${baseH}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: baseW, height: baseH, transform: `scale(${scale})` }}
      >
        <InviteRenderer
          template={template}
          fields={fields ?? template.defaultData}
          preview
          className="h-full"
        />
      </div>
    </div>
  )
}
