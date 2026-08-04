import type { SheetData } from "write-excel-file/browser"

import type { Rsvp, RsvpStatus } from "@/types"
import { csvDate, downloadCsv } from "./csv"
import { formatLongDate } from "./date"

export type ExportOrder = "confirmation" | "alpha"
export type ExportFormat = "xlsx" | "csv" | "print"

const STATUS_LABEL: Record<RsvpStatus, string> = {
  confirmed: "Confirmado",
  maybe: "Talvez",
  declined: "Não vai",
}

/** Cores por status — usadas no Excel e na impressão. */
const STATUS_COLOR: Record<RsvpStatus, { bg: string; text: string }> = {
  confirmed: { bg: "#d9f7e7", text: "#065f46" },
  maybe: { bg: "#fef3c7", text: "#92400e" },
  declined: { bg: "#f1f1f4", text: "#57534e" },
}

const HEAD = [
  "Nome",
  "Status",
  "Pessoas",
  "E-mail",
  "Telefone",
  "Recado",
  "Respondeu em",
] as const

const WIDTHS = [26, 14, 9, 30, 18, 44, 18]

export interface GuestExportInfo {
  title: string
  slug: string
  eventDate?: string
}

/** Ordena conforme a escolha: ordem de confirmação (cronológica) ou A–Z. */
export function sortForExport(rows: Rsvp[], order: ExportOrder): Rsvp[] {
  return [...rows].sort((a, b) =>
    order === "alpha"
      ? a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
      : a.created_at.localeCompare(b.created_at),
  )
}

function cells(r: Rsvp) {
  return [
    r.name,
    STATUS_LABEL[r.status],
    r.guests_count,
    r.email ?? "",
    r.phone ?? "",
    r.message ?? "",
    csvDate(r.created_at),
  ]
}

function subtitle(info: GuestExportInfo, rows: Rsvp[]): string {
  const confirmed = rows.filter((r) => r.status === "confirmed")
  const people = confirmed.reduce((s, r) => s + r.guests_count, 0)
  const when = info.eventDate ? `${formatLongDate(info.eventDate)} · ` : ""
  return `${when}${confirmed.length} confirmações · ${people} pessoas`
}

/** Planilha .xlsx formatada (cabeçalho colorido, colunas dimensionadas, totais). */
export async function exportGuestsXlsx(
  info: GuestExportInfo,
  rows: Rsvp[],
): Promise<void> {
  const { default: writeXlsxFile } = await import("write-excel-file/browser")

  const title = {
    value: info.title,
    fontWeight: "bold" as const,
    fontSize: 15,
    textColor: "#1a0533",
  }
  const head = HEAD.map((h) => ({
    value: h,
    fontWeight: "bold" as const,
    textColor: "#ffffff",
    backgroundColor: "#1a0533",
    align: "left" as const,
    borderColor: "#d8d5de",
  }))

  const body = rows.map((r) => {
    const color = STATUS_COLOR[r.status]
    return cells(r).map((value, i) => ({
      value,
      align: i === 2 ? ("center" as const) : ("left" as const),
      wrap: i === 5,
      borderColor: "#e6e4ea",
      ...(i === 1
        ? {
            backgroundColor: color.bg,
            textColor: color.text,
            fontWeight: "bold" as const,
            align: "center" as const,
          }
        : {}),
    }))
  })

  const confirmed = rows.filter((r) => r.status === "confirmed")
  const totals = [
    { value: "Total", fontWeight: "bold" as const },
    {
      value: `${confirmed.length} confirmações`,
      fontWeight: "bold" as const,
      align: "center" as const,
    },
    {
      value: confirmed.reduce((s, r) => s + r.guests_count, 0),
      fontWeight: "bold" as const,
      align: "center" as const,
    },
  ]

  const data: SheetData = [
    [title],
    [{ value: subtitle(info, rows), textColor: "#6b6580" }],
    [],
    head,
    ...body,
    [],
    totals,
  ]

  await writeXlsxFile(data, {
    sheet: "Confirmados",
    columns: WIDTHS.map((width) => ({ width })),
    stickyRowsCount: 4,
  }).toFile(`confirmados-${info.slug}.xlsx`)
}

/** CSV pronto pro Excel brasileiro (separador `;` + BOM). */
export function exportGuestsCsv(info: GuestExportInfo, rows: Rsvp[]): void {
  downloadCsv(
    `confirmados-${info.slug}`,
    [...HEAD],
    rows.map((r) => cells(r)),
  )
}

/** Abre uma folha pronta pra imprimir — no diálogo dá pra "Salvar como PDF". */
export function printGuestList(info: GuestExportInfo, rows: Rsvp[]): boolean {
  const esc = (v: unknown) =>
    String(v ?? "").replace(
      /[&<>"]/g,
      (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c,
    )

  const body = rows
    .map((r) => {
      const c = STATUS_COLOR[r.status]
      return `<tr>
        <td class="name">${esc(r.name)}</td>
        <td><span class="tag" style="background:${c.bg};color:${c.text}">${STATUS_LABEL[r.status]}</span></td>
        <td class="num">${r.guests_count}</td>
        <td>${esc(r.email ?? "")}</td>
        <td>${esc(r.phone ?? "")}</td>
        <td class="msg">${esc(r.message ?? "")}</td>
      </tr>`
    })
    .join("")

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Confirmados — ${esc(info.title)}</title>
<style>
  @page { margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #1a0533; margin: 0; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { color: #6b6580; font-size: 13px; margin: 0 0 18px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #1a0533; color: #fff; text-align: left; padding: 8px 10px; }
  th:first-child { border-radius: 6px 0 0 6px; }
  th:last-child { border-radius: 0 6px 6px 0; }
  td { padding: 8px 10px; border-bottom: 1px solid #e6e4ea; vertical-align: top; }
  tr:nth-child(even) td { background: #faf9fc; }
  .name { font-weight: 600; }
  .num { text-align: center; }
  .msg { color: #57534e; font-style: italic; max-width: 260px; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .foot { margin-top: 16px; font-size: 12px; color: #6b6580; }
  @media print { .tag { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
  <h1>${esc(info.title)}</h1>
  <p class="sub">${esc(subtitle(info, rows))}</p>
  <table>
    <thead><tr><th>Nome</th><th>Status</th><th>Pessoas</th><th>E-mail</th><th>Telefone</th><th>Recado</th></tr></thead>
    <tbody>${body}</tbody>
  </table>
  <p class="foot">${rows.length} respostas · gerado pelo Invitly em ${new Date().toLocaleDateString("pt-BR")}</p>
</body></html>`

  const win = window.open("", "_blank")
  if (!win) return false // bloqueado pelo navegador
  win.document.write(html)
  win.document.close()
  win.focus()
  win.addEventListener("load", () => win.print())
  // alguns navegadores já disparam o load antes do listener
  window.setTimeout(() => win.print(), 400)
  return true
}
