import { useState } from "react"
import type { FormEvent } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

import { useCreateRsvp } from "@/hooks/useRsvp"
import { cn } from "@/lib/utils"
import type { RsvpStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const STATUS_OPTIONS: { value: RsvpStatus; label: string; emoji: string }[] = [
  { value: "confirmed", label: "Vou!", emoji: "🎉" },
  { value: "maybe", label: "Talvez", emoji: "🤔" },
  { value: "declined", label: "Não vou", emoji: "😔" },
]

export function RsvpForm({
  inviteId,
  accentColor = "#ff6b9d",
  onSuccess,
}: {
  inviteId: string
  accentColor?: string
  onSuccess?: () => void
}) {
  const createRsvp = useCreateRsvp()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [guests, setGuests] = useState(1)
  const [status, setStatus] = useState<RsvpStatus>("confirmed")
  const [message, setMessage] = useState("")
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError("Informe seu nome.")
      return
    }
    setError(null)
    createRsvp.mutate(
      {
        invite_id: inviteId,
        name: name.trim(),
        email: email.trim() || undefined,
        status,
        guests_count: status === "declined" ? 0 : guests,
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => {
          setDone(true)
          onSuccess?.()
        },
        onError: () => setError("Não foi possível enviar. Tente de novo."),
      },
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="size-12" style={{ color: accentColor }} />
        <p className="text-lg font-semibold">Presença registrada!</p>
        <p className="text-sm text-muted-foreground">
          Obrigado por confirmar. Nos vemos no evento! 💜
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="rsvp-name">Seu nome *</Label>
        <Input
          id="rsvp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Como você se chama?"
          aria-invalid={!!error && name.trim().length < 2}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Você vai?</Label>
        <div className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={cn(
                "rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                status === opt.value
                  ? "border-transparent text-white"
                  : "border-border bg-background hover:bg-secondary",
              )}
              style={
                status === opt.value ? { backgroundColor: accentColor } : undefined
              }
            >
              <span className="mr-1" aria-hidden>
                {opt.emoji}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {status !== "declined" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="rsvp-guests">Quantas pessoas</Label>
            <Input
              id="rsvp-guests"
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rsvp-email">E-mail (opcional)</Label>
            <Input
              id="rsvp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="rsvp-message">Deixe um recado (opcional)</Label>
        <Textarea
          id="rsvp-message"
          rows={3}
          value={message}
          maxLength={300}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mande um carinho para os anfitriões..."
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        style={{ backgroundColor: accentColor }}
        disabled={createRsvp.isPending}
      >
        {createRsvp.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Confirmar presença
      </Button>
    </form>
  )
}
