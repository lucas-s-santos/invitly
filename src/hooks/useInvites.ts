import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import { buildInviteSlug } from "@/lib/slug"
import { getTemplateDefaults } from "@/lib/templates"
import { uploadInviteAudio, uploadInviteImage } from "@/lib/storage"
import { dataUrlToFile, isDataUrl } from "@/lib/image"
import type { Invite, InviteFields } from "@/types"

const inviteKeys = {
  mine: ["invites", "mine"] as const,
  detail: (id: string) => ["invite", id] as const,
  slug: (slug: string) => ["invite", "slug", slug] as const,
}

/** Lista os convites do usuário logado. */
export function useMyInvites() {
  return useQuery({
    queryKey: inviteKeys.mine,
    queryFn: async (): Promise<Invite[]> => {
      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })
}

/** Busca um convite por id (dono). */
export function useInvite(id: string | undefined) {
  return useQuery({
    queryKey: inviteKeys.detail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async (): Promise<Invite> => {
      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .eq("id", id!)
        .single()
      if (error) throw error
      return data
    },
  })
}

/** Busca um convite publicado por slug (página pública). */
export function useInviteBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: inviteKeys.slug(slug ?? ""),
    enabled: Boolean(slug),
    queryFn: async (): Promise<Invite | null> => {
      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "published")
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

/**
 * Busca um convite por slug em qualquer status (para o dono ver a lista de
 * confirmados mesmo antes/depois de publicar). RLS garante que só o dono lê
 * o próprio convite não publicado.
 */
export function useInviteBySlugForOwner(slug: string | undefined) {
  return useQuery({
    queryKey: ["invite", "slug-owner", slug ?? ""],
    enabled: Boolean(slug),
    queryFn: async (): Promise<Invite | null> => {
      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

/** Cria um rascunho a partir de um template e retorna o convite. */
export function useCreateInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      templateId,
      category,
      fields,
    }: {
      templateId: string
      category: string
      /** campos já editados (ex: rascunho de convidado); senão usa os padrões */
      fields?: InviteFields
    }): Promise<Invite> => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) throw new Error("Você precisa estar logado.")

      const defaults = getTemplateDefaults(templateId)
      if (!defaults) throw new Error("Template inválido.")

      const content = fields ?? defaults
      const title = content.title?.trim() || "Convite"

      // Mídia embutida (rascunho de convidado): não guarda base64 no banco —
      // insere sem ela e depois sobe pro Storage, trocando pela URL pública.
      const mediaFields: (keyof InviteFields)[] = [
        "background_image",
        "music_cover",
        "music_url",
      ]
      const inlineKeys = mediaFields.filter((k) => isDataUrl(content[k] as string))
      const inlineGallery = (content.gallery ?? []).filter(isDataUrl)

      const insertContent = { ...content }
      for (const k of inlineKeys) insertContent[k] = undefined as never
      if (inlineGallery.length > 0) {
        insertContent.gallery = (content.gallery ?? []).filter(
          (url) => !isDataUrl(url),
        )
      }

      const { data, error } = await supabase
        .from("invites")
        .insert({
          user_id: user.id,
          slug: buildInviteSlug(title),
          title,
          category,
          template_id: templateId,
          data: insertContent,
        })
        .select()
        .single()
      if (error) throw error

      if (inlineKeys.length > 0 || inlineGallery.length > 0) {
        const patched = { ...content }

        for (const k of inlineKeys) {
          try {
            const raw = content[k] as string
            if (k === "music_url") {
              const file = await dataUrlToFile(raw, "musica.mp3")
              patched[k] = (await uploadInviteAudio(file, data.id)) as never
            } else {
              const file = await dataUrlToFile(raw, `${k}.jpg`)
              patched[k] = (await uploadInviteImage(file, data.id)) as never
            }
          } catch {
            patched[k] = undefined as never // se falhar, segue sem essa mídia
          }
        }

        if (inlineGallery.length > 0) {
          const uploaded: string[] = []
          for (const url of content.gallery ?? []) {
            if (!isDataUrl(url)) {
              uploaded.push(url) // já era URL pública
              continue
            }
            try {
              const file = await dataUrlToFile(url, "galeria.jpg")
              uploaded.push(await uploadInviteImage(file, data.id))
            } catch {
              // foto que falhou fica de fora, o resto da galeria segue
            }
          }
          patched.gallery = uploaded
        }

        const { data: updated, error: upErr } = await supabase
          .from("invites")
          .update({ data: patched })
          .eq("id", data.id)
          .select()
          .single()
        if (!upErr && updated) return updated
      }

      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inviteKeys.mine })
    },
  })
}

/** Atualiza campos/dados do convite (usado pelo auto-save do editor). */
export function useUpdateInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      title,
      fields,
      templateId,
      category,
    }: {
      id: string
      title?: string
      fields?: InviteFields
      templateId?: string
      category?: string
    }): Promise<Invite> => {
      const patch: {
        title?: string
        data?: InviteFields
        template_id?: string
        category?: string
      } = {}
      if (title !== undefined) patch.title = title
      if (fields !== undefined) patch.data = fields
      if (templateId !== undefined) patch.template_id = templateId
      if (category !== undefined) patch.category = category

      const { data, error } = await supabase
        .from("invites")
        .update(patch)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (invite) => {
      qc.setQueryData(inviteKeys.detail(invite.id), invite)
      void qc.invalidateQueries({ queryKey: inviteKeys.mine })
    },
  })
}

/** Exclui um convite (cascade remove rsvp e views). */
export function useDeleteInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("invites").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inviteKeys.mine })
    },
  })
}

/** Duplica um convite como novo rascunho. */
export function useDuplicateInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (source: Invite): Promise<Invite> => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) throw new Error("Você precisa estar logado.")

      const title = `${source.title} (cópia)`
      const { data, error } = await supabase
        .from("invites")
        .insert({
          user_id: user.id,
          slug: buildInviteSlug(title),
          title,
          category: source.category,
          template_id: source.template_id,
          data: source.data,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inviteKeys.mine })
    },
  })
}

// Não existe hook de publicar de propósito: `invites.status` é bloqueado no
// banco para quem chega pelo navegador (migration 0006_publish_guard.sql).
// Quem publica é o webhook da Kiwify (service_role) ou o painel admin, via
// admin_set_invite_status(). Qualquer update de status daqui seria recusado.
