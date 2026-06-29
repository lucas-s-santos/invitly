import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

export function FullScreenLoader() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm">{t("common.loading")}</p>
    </div>
  )
}
