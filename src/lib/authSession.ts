// Prova de que a pessoa realmente entrou na conta nesta sessão do navegador
// (digitou e-mail e senha, ou passou pelo Google) — em vez de ter a sessão
// restaurada sozinha do localStorage.
//
// Fica no sessionStorage de propósito: sobrevive a recarregar a página, mas
// morre quando o navegador fecha. Contas de administrador só valem com essa
// marca; usuário comum continua logado normalmente entre visitas.

const VERIFIED_KEY = "invitly-auth-verified"
const OAUTH_KEY = "invitly-auth-oauth-pending"

/** Id do usuário cujo login foi feito de verdade nesta sessão do navegador. */
export function readVerifiedUserId(): string | null {
  try {
    return sessionStorage.getItem(VERIFIED_KEY)
  } catch {
    return null
  }
}

export function writeVerifiedUserId(userId: string) {
  try {
    sessionStorage.setItem(VERIFIED_KEY, userId)
  } catch {
    // sessionStorage indisponível — ignora
  }
}

export function clearVerifiedUserId() {
  try {
    sessionStorage.removeItem(VERIFIED_KEY)
  } catch {
    // ignora
  }
}

/** Marca que um login pelo Google está em andamento (sobrevive ao redirect). */
export function markOAuthPending() {
  try {
    sessionStorage.setItem(OAUTH_KEY, "1")
  } catch {
    // ignora
  }
}

/** Lê e limpa a marca do Google — true quando voltamos de um login OAuth. */
export function consumeOAuthPending(): boolean {
  try {
    const pending = sessionStorage.getItem(OAUTH_KEY) === "1"
    if (pending) sessionStorage.removeItem(OAUTH_KEY)
    return pending
  } catch {
    return false
  }
}
