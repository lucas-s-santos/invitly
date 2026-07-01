import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

const CONSENT_KEY = "invitly-cookie-consent"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
  }, [])

  if (!visible) return null

  function accept() {
    localStorage.setItem(CONSENT_KEY, new Date().toISOString())
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:gap-4">
        <p className="text-sm text-muted-foreground">
          Usamos cookies essenciais para o funcionamento do Invitly. Ao
          continuar, você concorda com nossa{" "}
          <Link
            to="/privacidade"
            className="font-medium text-primary underline underline-offset-2"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          Entendi
        </Button>
      </div>
    </div>
  )
}
