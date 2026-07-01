// Tipos do banco de dados (espelham as migrations em supabase/migrations).

export type InviteStatus = "draft" | "paid" | "published" | "expired"
export type RsvpStatus = "confirmed" | "declined" | "maybe"
export type DeviceType = "mobile" | "desktop"

/** Conteúdo customizado do convite (campos do template preenchidos). */
export type InviteData = Record<string, unknown>

/**
 * Dados padronizados de um convite (preenchidos no editor).
 * Usamos `type` (não `interface`) para ser atribuível a Record<string, unknown>,
 * exigência da tipagem do supabase-js.
 */
export type InviteFields = {
  title: string
  hosts: string
  event_date: string
  event_time: string
  location: string
  message: string
  /** overrides opcionais escolhidos no editor */
  primary_color?: string
  background_color?: string
  /** URL pública da foto de fundo (Supabase Storage) */
  background_image?: string
  /** força a cor do texto para contraste ("light" = claro, "dark" = escuro) */
  text_mode?: "light" | "dark"
}

export type Invite = {
  id: string
  user_id: string
  slug: string
  title: string
  category: string
  template_id: string
  status: InviteStatus
  data: InviteFields
  views: number
  created_at: string
  expires_at: string | null
  payment_id: string | null
}

export type Rsvp = {
  id: string
  invite_id: string
  name: string
  email: string | null
  phone: string | null
  status: RsvpStatus
  guests_count: number
  message: string | null
  created_at: string
}

export type InviteView = {
  id: string
  invite_id: string
  viewed_at: string
  ip_hash: string | null
  device: DeviceType | null
}

type InsertOf<T, Optional extends keyof T> = Omit<T, Optional> &
  Partial<Pick<T, Optional>>

/** Tipagem usada por createClient<Database>() do supabase-js. */
export interface Database {
  public: {
    Tables: {
      invites: {
        Row: Invite
        Insert: InsertOf<
          Invite,
          "id" | "status" | "views" | "created_at" | "expires_at" | "payment_id"
        >
        Update: Partial<Invite>
        Relationships: []
      }
      rsvp: {
        Row: Rsvp
        Insert: InsertOf<
          Rsvp,
          | "id"
          | "email"
          | "phone"
          | "status"
          | "guests_count"
          | "message"
          | "created_at"
        >
        Update: Partial<Rsvp>
        Relationships: []
      }
      invite_views: {
        Row: InviteView
        Insert: InsertOf<
          InviteView,
          "id" | "viewed_at" | "ip_hash" | "device"
        >
        Update: Partial<InviteView>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      register_invite_view: {
        Args: { p_slug: string; p_ip_hash?: string; p_device?: string }
        Returns: undefined
      }
      delete_my_account: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: Record<string, never>
  }
}
