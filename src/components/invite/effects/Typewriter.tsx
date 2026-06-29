import { useEffect, useState } from "react"
import type { CSSProperties } from "react"

interface TypewriterProps {
  text: string
  speed?: number
  className?: string
  style?: CSSProperties
}

export function Typewriter({
  text,
  speed = 55,
  className,
  style,
}: TypewriterProps) {
  const [shown, setShown] = useState("")

  useEffect(() => {
    setShown("")
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return (
    <span className={className} style={style}>
      {shown}
      <span
        className="ml-0.5 inline-block animate-pulse"
        aria-hidden
        style={{ opacity: shown.length === text.length ? 0 : 1 }}
      >
        |
      </span>
    </span>
  )
}
