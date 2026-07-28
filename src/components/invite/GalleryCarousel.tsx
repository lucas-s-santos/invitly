import type { CSSProperties } from "react"

/**
 * Fotos da galeria rolando sozinhas, lado a lado (marquee contínuo).
 * Sem setas, sem paginação — passa infinito. As bordas ganham um leve fade.
 */
export function GalleryCarousel({ images }: { images: string[] }) {
  if (images.length === 0) return null

  // duplica a sequência para o loop não ter emenda
  const loop = images.length < 4 ? [...images, ...images, ...images] : [...images, ...images]
  const duration = Math.max(16, loop.length * 3.5)

  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        className="invitly-marquee flex w-max gap-3"
        style={{ "--duration": `${duration}s` } as CSSProperties}
      >
        {loop.map((url, i) => (
          <img
            key={`${url}-${i}`}
            src={url}
            alt=""
            loading="lazy"
            aria-hidden={i >= images.length}
            className="size-20 shrink-0 rounded-2xl object-cover shadow-lg ring-1 ring-white/25"
          />
        ))}
      </div>
    </div>
  )
}
