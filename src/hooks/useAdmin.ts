import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import type { AdminInviteRow, AdminStats, AdminUserRow } from "@/types"

const adminKeys = {
  stats: ["admin", "stats"] as const,
  invites: ["admin", "invites"] as const,
  users: ["admin", "users"] as const,
  admins: ["admin", "admins"] as const,
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: async (): Promise<AdminStats> => {
      const { data, error } = await supabase.rpc("admin_stats")
      if (error) throw error
      return data as AdminStats
    },
  })
}

export function useAdminInvites() {
  return useQuery({
    queryKey: adminKeys.invites,
    queryFn: async (): Promise<AdminInviteRow[]> => {
      const { data, error } = await supabase.rpc("admin_invites")
      if (error) throw error
      return (data ?? []) as AdminInviteRow[]
    },
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: async (): Promise<AdminUserRow[]> => {
      const { data, error } = await supabase.rpc("admin_users")
      if (error) throw error
      return (data ?? []) as AdminUserRow[]
    },
  })
}

export function useAdminAdmins() {
  return useQuery({
    queryKey: adminKeys.admins,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.rpc("admin_admins")
      if (error) throw error
      return (data ?? []) as string[]
    },
  })
}

export function useAdminSetStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.rpc("admin_set_invite_status", {
        p_id: id,
        p_status: status,
      })
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.invites })
      void qc.invalidateQueries({ queryKey: adminKeys.stats })
    },
  })
}

export function useAdminDeleteInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("admin_delete_invite", { p_id: id })
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.invites })
      void qc.invalidateQueries({ queryKey: adminKeys.stats })
    },
  })
}

export function useAdminAddAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.rpc("admin_add_admin", { p_email: email })
      if (error) throw error
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.admins }),
  })
}

export function useAdminRemoveAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.rpc("admin_remove_admin", {
        p_email: email,
      })
      if (error) throw error
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.admins }),
  })
}
