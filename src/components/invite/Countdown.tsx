import { useEffect, useState } from "react"

interface CountdownProps {
  target: Date
  accentColor: string
  mutedColor: string
}

interface Parts {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

function diff(target: Date): Parts {
  const ms = target.getTime() - Date.now()
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  }
}

export function Countdown({ target, accentColor, mutedColor }: CountdownProps) {
  const [parts, setParts] = useState<Parts>(() => diff(target))

  useEffect(() => {
    const id = setInterval(() => setParts(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (parts.done) {
    return (
      <p
        className="text-sm font-semibold tracking-wide uppercase"
        style={{ color: accentColor }}
      >
        É hoje! 🎉
      </p>
    )
  }

  const units = [
    { value: parts.days, label: "dias" },
    { value: parts.hours, label: "horas" },
    { value: parts.minutes, label: "min" },
    { value: parts.seconds, label: "seg" },
  ]

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span
            className="font-display text-3xl font-bold tabular-nums sm:text-4xl"
            style={{ color: accentColor }}
          >
            {String(u.value).padStart(2, "0")}
          </span>
          <span
            className="text-[10px] tracking-widest uppercase"
            style={{ color: mutedColor }}
          >
            {u.label}
          </span>
        </div>
      ))}
    </div>
  )
}
