import type { InviteFields } from "@/types"

/** Rascunho de convite criado sem login (guardado no navegador). */
export interface GuestDraft {
  templateId: string
  category: string
  fields: InviteFields
}

const KEY = "invitly-guest-draft"
const INTENT_KEY = "invitly-publish-intent"

export function saveGuestDraft(draft: GuestDraft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    // localStorage indisponível — ignora
  }
}

export function loadGuestDraft(): GuestDraft | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GuestDraft) : null
  } catch {
    return null
  }
}

export function clearGuestDraft() {
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem(INTENT_KEY)
  } catch {
    // ignora
  }
}

/** Marca que o convidado quer publicar (para retomar após o cadastro). */
export function setPublishIntent() {
  try {
    localStorage.setItem(INTENT_KEY, "1")
  } catch {
    // ignora
  }
}

export function hasPublishIntent(): boolean {
  try {
    return localStorage.getItem(INTENT_KEY) === "1"
  } catch {
    return false
  }
}
