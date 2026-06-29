import { parseEventDate } from "@/lib/date"
import type { InviteFields } from "@/types"

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

/** Formato de data local "flutuante": YYYYMMDDTHHMMSS */
function fmt(d: Date): string {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  )
}

function eventRange(fields: InviteFields): { start: Date; end: Date } | null {
  const start = parseEventDate(fields.event_date, fields.event_time || "00:00")
  if (!start) return null
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // +2h
  return { start, end }
}

export function buildGoogleCalendarUrl(fields: InviteFields): string | null {
  const range = eventRange(fields)
  if (!range) return null
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: fields.title || "Evento",
    dates: `${fmt(range.start)}/${fmt(range.end)}`,
    details: fields.message || "",
    location: fields.location || "",
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function escapeIcs(value: string | undefined): string {
  return (value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

/** Gera e baixa um arquivo .ics (Apple Calendar / Outlook). */
export function downloadIcs(fields: InviteFields): void {
  const range = eventRange(fields)
  if (!range) return
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitly//PT-BR//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@invitly`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(range.start)}`,
    `DTEND:${fmt(range.end)}`,
    `SUMMARY:${escapeIcs(fields.title)}`,
    `DESCRIPTION:${escapeIcs(fields.message)}`,
    `LOCATION:${escapeIcs(fields.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${fields.title || "evento"}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
