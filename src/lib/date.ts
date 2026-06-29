/** Combina data (YYYY-MM-DD) + hora (HH:mm) num Date local. */
export function parseEventDate(
  date?: string,
  time?: string,
): Date | null {
  if (!date) return null
  const iso = time ? `${date}T${time}` : `${date}T00:00`
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "12 de dezembro de 2026" */
export function formatLongDate(date?: string, locale = "pt-BR"): string {
  const d = parseEventDate(date)
  if (!d) return ""
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d)
}
