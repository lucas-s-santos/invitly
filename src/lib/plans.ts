import type { InviteFields } from "@/types"

export const BASIC_PRICE = import.meta.env.VITE_KIWIFY_PRICE || "R$ 12,90"
export const PREMIUM_PRICE =
  import.meta.env.VITE_KIWIFY_PRICE_PREMIUM || "R$ 19,90"

/**
 * Recursos Premium já configurados no convite.
 *
 * O editor não bloqueia nada: a pessoa monta o convite inteiro e só na
 * publicação vê o preço. Se esta lista não estiver vazia, o checkout já
 * abre com o plano Premium marcado (é o que o convite precisa pra funcionar).
 */
export function premiumFeaturesUsed(fields: InviteFields): string[] {
  const used: string[] = []
  if (fields.music_url?.trim()) used.push("🎵 Música")
  if (fields.gallery && fields.gallery.length > 0) used.push("📸 Galeria")
  if (
    fields.pix_key?.trim() ||
    fields.gift_url?.trim() ||
    (fields.gift_items && fields.gift_items.some((g) => g.name.trim()))
  )
    used.push("🎁 Presentes/PIX")
  if (fields.background_filter && fields.background_filter !== "none")
    used.push("🎨 Filtro da foto")
  if (fields.font_family) used.push("✍️ Fonte especial")
  return used
}
