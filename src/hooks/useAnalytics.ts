import { useQuery } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"

export interface DailyViews {
  date: string
  label: string
  views: number
}

/** Visualizações por dia (últimos 7 dias) de um convite. */
export function useInviteViews(inviteId: string | undefined) {
  return useQuery({
    queryKey: ["views", inviteId ?? ""],
    enabled: Boolean(inviteId),
    queryFn: async (): Promise<DailyViews[]> => {
      const since = new Date()
      since.setDate(since.getDate() - 6)
      since.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from("invite_views")
        .select("viewed_at")
        .eq("invite_id", inviteId!)
        .gte("viewed_at", since.toISOString())
      if (error) throw error

      const counts: Record<string, number> = {}
      for (const row of data) {
        const key = new Date(row.viewed_at).toISOString().slice(0, 10)
        counts[key] = (counts[key] ?? 0) + 1
      }

      const fmt = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })
      const buckets: DailyViews[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const key = d.toISOString().slice(0, 10)
        buckets.push({ date: key, label: fmt.format(d), views: counts[key] ?? 0 })
      }
      return buckets
    },
  })
}
