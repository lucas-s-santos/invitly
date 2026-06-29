import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="bg-brand-aurora flex min-h-svh flex-col items-center justify-center px-6 text-center text-white">
      <p className="font-display text-7xl font-black text-brand-gold">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
        {t("notFound.title")}
      </h1>
      <p className="mt-3 max-w-sm text-white/70">{t("notFound.subtitle")}</p>
      <Button asChild size="lg" className="mt-8">
        <Link to="/">{t("notFound.button")}</Link>
      </Button>
    </div>
  )
}
