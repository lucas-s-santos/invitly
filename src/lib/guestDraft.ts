import type { InviteFields } from "@/types"

/** Rascunho de convite criado sem login (guardado no navegador). */
export interface GuestDraft {
  templateId: string
  category: string
  fields: InviteFields
}

// O rascunho mora no IndexedDB, e não no localStorage, porque o convidado pode
// embutir fotos e até um mp3 antes de criar a conta — o teto de ~5 MB do
// localStorage estourava e o rascunho parava de salvar em silêncio.
// A intenção de publicar continua no localStorage: é um "1", e precisa ser
// lida de forma síncrona na montagem dos componentes.
const DB_NAME = "invitly"
const DB_VERSION = 1
const STORE = "drafts"
const KEY = "current"
const LEGACY_KEY = "invitly-guest-draft"
const INTENT_KEY = "invitly-publish-intent"

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error("IndexedDB indisponível."))
  })
}

function runTx<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const req = work(tx.objectStore(STORE))
        tx.oncomplete = () => {
          db.close()
          resolve(req.result)
        }
        tx.onerror = () => {
          db.close()
          reject(tx.error ?? new Error("Falha ao gravar o rascunho."))
        }
        tx.onabort = () => {
          db.close()
          reject(tx.error ?? new Error("Gravação do rascunho cancelada."))
        }
      }),
  )
}

/**
 * Grava o rascunho. Diferente da versão antiga, **propaga o erro**: falhar em
 * silêncio aqui significa a pessoa perder o convite que acabou de montar.
 */
export async function saveGuestDraft(draft: GuestDraft): Promise<void> {
  await runTx("readwrite", (store) => store.put(draft, KEY))
}

export async function loadGuestDraft(): Promise<GuestDraft | null> {
  try {
    const draft = await runTx<GuestDraft | undefined>("readonly", (store) =>
      store.get(KEY),
    )
    if (draft) return draft
  } catch {
    // IndexedDB indisponível (modo privado antigo, etc.) — tenta o legado
  }
  return migrateLegacyDraft()
}

export async function clearGuestDraft(): Promise<void> {
  try {
    localStorage.removeItem(LEGACY_KEY)
    localStorage.removeItem(INTENT_KEY)
  } catch {
    // ignora
  }
  try {
    await runTx("readwrite", (store) => store.delete(KEY))
  } catch {
    // ignora
  }
}

/** Rascunho de antes da migração: traz pro IndexedDB e limpa o localStorage. */
async function migrateLegacyDraft(): Promise<GuestDraft | null> {
  let legacy: GuestDraft | null = null
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    legacy = raw ? (JSON.parse(raw) as GuestDraft) : null
  } catch {
    return null
  }
  if (!legacy) return null

  try {
    await saveGuestDraft(legacy)
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // se não deu pra migrar, o rascunho antigo ainda serve para esta sessão
  }
  return legacy
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
