import { supabase } from "@/lib/supabase"

const BUCKET = "invite-images"
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/** Faz upload da foto de fundo do convite e retorna a URL pública. */
export async function uploadInviteImage(
  file: File,
  inviteId: string,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie um arquivo de imagem.")
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Imagem muito grande (máx. 5 MB).")
  }

  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id
  if (!uid) throw new Error("Você precisa estar logado.")

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const path = `${uid}/${inviteId}-${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
