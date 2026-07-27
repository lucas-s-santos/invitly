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
      <img
        src="/logo.png"
        alt={iconOnly ? "Invitly" : ""}
        aria-hidden={!iconOnly}
        className="h-9 w-auto shrink-0 object-contain"
        draggable={false}
      />
      {!iconOnly ? (
        <span className="font-display text-xl font-extrabold tracking-tight">
          Invitly
        </span>
      ) : null}
    </span>
  )
}
