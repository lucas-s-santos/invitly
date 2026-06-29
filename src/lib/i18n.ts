import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import ptBR from "@/locales/pt-BR/common.json"
import en from "@/locales/en/common.json"

export const SUPPORTED_LNGS = ["pt-BR", "en"] as const
export type SupportedLng = (typeof SUPPORTED_LNGS)[number]

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "pt-BR": { translation: ptBR },
      en: { translation: en },
    },
    fallbackLng: "pt-BR",
    supportedLngs: [...SUPPORTED_LNGS],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })

export default i18n
