/**
 * Exporta CSV que o Excel brasileiro abre já separado em colunas.
 *
 * O Excel em pt-BR usa `;` como separador de lista — com `,` ele joga a linha
 * inteira numa célula só (a "bagunça" ao abrir). Usamos `;`, BOM UTF-8 para os
 * acentos e CRLF nas quebras.
 */
export function downloadCsv(
  filename: string,
  head: string[],
  rows: (string | number | null | undefined)[][],
): void {
  const esc = (v: string | number | null | undefined) => {
    // quebras de linha dentro da célula viram espaço, senão o Excel quebra a linha
    const s = String(v ?? "").replace(/\r?\n/g, " ")
    return `"${s.replace(/"/g, '""')}"`
  }
  const body = [head, ...rows].map((r) => r.map(esc).join(";")).join("\r\n")
  const csv = `﻿${body}\r\n`

  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  )
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/** Data/hora em formato curto que o Excel entende (dd/mm/aaaa hh:mm). */
export function csvDate(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}
