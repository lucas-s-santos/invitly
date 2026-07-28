// Contas administradoras (donos) — podem publicar sem pagar, para testar.
// Configure em VITE_ADMIN_EMAILS (e-mails separados por vírgula).

function getAdminEmails(): string[] {
  return (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/** true se o e-mail está na lista de administradores. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}
