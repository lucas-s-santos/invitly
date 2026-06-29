import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

const LANGS = [
  { code: "pt-BR", label: "PT", flag: "🇧🇷" },
  { code: "en", label: "EN", flag: "🇺🇸" },
] as const

export function LanguageToggle({ className }: { className?: string }) {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage?.startsWith("pt") ? "pt-BR" : "en"

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-background/60 p-0.5 text-xs font-semibold backdrop-blur",
        className,
      )}
      role="group"
      aria-label="Idioma / Language"
    >
      {LANGS.map((lang) => {
        const active = current === lang.code
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => void i18n.changeLanguage(lang.code)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span aria-hidden className="mr-1">
              {lang.flag}
            </span>
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}
