import { supabase } from "@/lib/supabase"

const BUCKET = "invite-images"
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_AUDIO_BYTES = 10 * 1024 * 1024 // 10 MB

/** Sobe um arquivo pro bucket e devolve a URL pública. */
async function uploadToBucket(file: File, inviteId: string): Promise<string> {
  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id
  if (!uid) throw new Error("Você precisa estar logado.")

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
  const path = `${uid}/${inviteId}-${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/** Faz upload de uma imagem (foto de fundo, galeria, capa) e retorna a URL. */
export async function uploadInviteImage(
  file: File,
  inviteId: string,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie um arquivo de imagem.")
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Imagem muito grande (máx. 5 MB).")
  }
  return uploadToBucket(file, inviteId)
}

/**
 * Valida um áudio antes de usar. Vale para os dois caminhos: upload direto
 * (com conta) e rascunho embutido no navegador (sem conta).
 */
export function assertValidAudio(file: File) {
  if (!file.type.startsWith("audio/")) {
    throw new Error("Envie um arquivo de áudio (mp3, m4a...).")
  }
  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error("Áudio muito grande (máx. 10 MB).")
  }
}

/** Faz upload de um áudio (música do convite) e retorna a URL. */
export async function uploadInviteAudio(
  file: File,
  inviteId: string,
): Promise<string> {
  assertValidAudio(file)
  return uploadToBucket(file, inviteId)
}
