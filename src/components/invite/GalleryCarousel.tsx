/**
 * Fotos da galeria rolando sozinhas, lado a lado (marquee contínuo, sem emenda).
 * Sem setas, sem paginação. As bordas ganham um leve fade.
 */
export function GalleryCarousel({
  images,
  height = 128,
}: {
  images: string[]
  height?: number
}) {
  if (images.length === 0) return null

  // Repete até ter uma base grande o suficiente e duplica p/ o loop sem emenda
  // (translateX -50% cai exatamente no início da 2ª cópia idêntica).
  let seq = images
  while (seq.length < 6) seq = [...seq, ...images]
  const strip = [...seq, ...seq]
  const duration = Math.max(18, seq.length * 3)

  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        className="invitly-marquee flex w-max gap-3"
        style={{ animationDuration: `${duration}s` }}
      >
        {strip.map((url, i) => (
          <img
            key={`${url}-${i}`}
            src={url}
            alt=""
            aria-hidden
            loading="lazy"
            style={{ height }}
            className="w-auto shrink-0 rounded-2xl object-contain shadow-lg ring-1 ring-white/15"
          />
        ))}
      </div>
    </div>
  )
}
