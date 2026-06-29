import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

interface PagePlaceholderProps {
  title: string
  description?: string
  badge?: string
  backTo?: string
  backLabel?: string
  children?: ReactNode
}

export function PagePlaceholder({
  title,
  description,
  badge,
  backTo = "/dashboard",
  backLabel,
  children,
}: PagePlaceholderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
        <Sparkles className="size-3.5 text-primary" />
        {badge ?? t("common.comingSoon")}
      </div>
      <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-md text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
      <Button asChild variant="outline" className="mt-8">
        <Link to={backTo}>
          <ArrowLeft className="size-4" />
          {backLabel ?? t("auth.backHome")}
        </Link>
      </Button>
    </div>
  )
}
