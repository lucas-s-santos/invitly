import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import type { Rsvp, RsvpStatus } from "@/types"

const rsvpKeys = {
  byInvite: (inviteId: string) => ["rsvp", inviteId] as const,
  summary: ["rsvp", "summary"] as const,
}

export interface RsvpSummary {
  /** confirmações (status = confirmed) */
  confirmed: number
  /** total de pessoas somando acompanhantes (status = confirmed) */
  people: number
  /** total de respostas (qualquer status) */
  total: number
}

/**
 * Resumo de confirmações por convite do usuário (uma query só).
 * Retorna um mapa invite_id -> { confirmed, people, total }.
 */
export function useMyRsvpSummary() {
  return useQuery({
    queryKey: rsvpKeys.summary,
    queryFn: async (): Promise<Record<string, RsvpSummary>> => {
      const { data, error } = await supabase
        .from("rsvp")
        .select("invite_id,status,guests_count")
      if (error) throw error

      const map: Record<string, RsvpSummary> = {}
      for (const row of data) {
        const s = (map[row.invite_id] ??= { confirmed: 0, people: 0, total: 0 })
        s.total += 1
        if (row.status === "confirmed") {
          s.confirmed += 1
          s.people += row.guests_count
        }
      }
      return map
    },
  })
}

/** Lista as confirmações de um convite (só o dono enxerga, via RLS). */
export function useInviteRsvps(inviteId: string | undefined) {
  return useQuery({
    queryKey: rsvpKeys.byInvite(inviteId ?? ""),
    enabled: Boolean(inviteId),
    queryFn: async (): Promise<Rsvp[]> => {
      const { data, error } = await supabase
        .from("rsvp")
        .select("*")
        .eq("invite_id", inviteId!)
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export interface CreateRsvpInput {
  invite_id: string
  name: string
  email?: string
  phone?: string
  status: RsvpStatus
  guests_count: number
  message?: string
}

/**
 * Cria uma confirmação de presença (qualquer pessoa, via RLS de insert).
 * Não usamos `.select()` porque o anônimo não tem permissão de leitura em rsvp
 * (só o dono lê a lista) — pedir a representação de volta quebraria o insert.
 */
export function useCreateRsvp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateRsvpInput): Promise<void> => {
      const { error } = await supabase.from("rsvp").insert({
        invite_id: input.invite_id,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        status: input.status,
        guests_count: input.guests_count,
        message: input.message ?? null,
      })
      if (error) throw error
    },
    onSuccess: (_data, input) => {
      void qc.invalidateQueries({
        queryKey: rsvpKeys.byInvite(input.invite_id),
      })
      void qc.invalidateQueries({ queryKey: rsvpKeys.summary })
    },
  })
}
