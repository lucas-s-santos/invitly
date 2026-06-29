import { useEffect, useRef, useState } from "react"

/** Dispara `inView=true` uma vez quando o elemento entra na viewport. */
export function useInView<T extends Element>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      options ?? { threshold: 0.25 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return { ref, inView }
}
