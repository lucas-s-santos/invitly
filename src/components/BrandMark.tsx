import { cn } from "@/lib/utils"

export function BrandMark({
  className,
  iconOnly = false,
}: {
  className?: string
  iconOnly?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden>
        <defs>
          <linearGradient id="invitly-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff6b9d" />
            <stop offset="1" stopColor="#1a0533" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#invitly-mark)" />
        <rect x="6.5" y="9" width="19" height="14" rx="2.5" fill="#fff" />
        <path
          d="M7.5 10.8 L16 17 L24.5 10.8"
          fill="none"
          stroke="#ff6b9d"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24.5 5.2 l0.85 2.1 2.1 0.85 -2.1 0.85 -0.85 2.1 -0.85 -2.1 -2.1 -0.85 2.1 -0.85 z"
          fill="#ffd700"
        />
      </svg>
      {!iconOnly ? (
        <span className="font-display text-xl font-extrabold tracking-tight">
          Invitly
        </span>
      ) : null}
    </span>
  )
}
