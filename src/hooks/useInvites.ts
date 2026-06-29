import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import { buildInviteSlug } from "@/lib/slug"
import { getTemplateDefaults } from "@/lib/templates"
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
    }: {
      templateId: string
      category: string
    }): Promise<Invite> => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) throw new Error("Você precisa estar logado.")

      const defaults = getTemplateDefaults(templateId)
      if (!defaults) throw new Error("Template inválido.")

      const { data, error } = await supabase
        .from("invites")
        .insert({
          user_id: user.id,
          slug: buildInviteSlug(defaults.title),
          title: defaults.title,
          category,
          template_id: templateId,
          data: defaults,
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

/** Atualiza campos/dados do convite (usado pelo auto-save do editor). */
export function useUpdateInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      title,
      fields,
    }: {
      id: string
      title?: string
      fields?: InviteFields
    }): Promise<Invite> => {
      const patch: { title?: string; data?: InviteFields } = {}
      if (title !== undefined) patch.title = title
      if (fields !== undefined) patch.data = fields

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

/**
 * Publica o convite (temporário: até a Fase 3 com Kiwify, publicamos direto).
 */
export function usePublishInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<Invite> => {
      const { data, error } = await supabase
        .from("invites")
        .update({ status: "published" })
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
