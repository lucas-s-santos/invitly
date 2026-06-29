const DIACRITICS = /\p{Diacritic}/gu

/** Converte um texto em slug seguro para URL. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/** Slug único para o convite: base + ano + sufixo aleatório. */
export function buildInviteSlug(title: string): string {
  const base = slugify(title) || "convite"
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).slice(2, 7)
  return `${base}-${year}-${rand}`
}
