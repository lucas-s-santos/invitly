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

  // ── Ajustes da foto de fundo ──
  /** Enquadramento (object-position), ex: "50% 30%". */
  background_position?: string
  /** Zoom da foto (1 = normal, até ~3). */
  background_zoom?: number
  /** Escurecimento sobre a foto (0–100), p/ legibilidade do texto. */
  background_overlay?: number
  /** Desfoque da foto (px, 0–20). */
  background_blur?: number
  /** Brilho da foto (%, 50–150). */
  background_brightness?: number
  /** Filtro artístico da foto. */
  background_filter?: "none" | "bw" | "sepia" | "vintage"

  // ── Estilo do texto / entrada ──
  /** Tamanho do título. */
  title_size?: "sm" | "md" | "lg"
  /** Fonte do título (valor CSS de font-family). */
  font_family?: string
  /** Animação de entrada do conteúdo. */
  entrance?: "fade" | "up" | "zoom" | "down"

  // ── Extras do convite (opcionais) ──
  /** Link do mapa (Google Maps/Waze). Se vazio, gera busca a partir de `location`. */
  maps_url?: string
  /** Galeria de fotos — URLs públicas no Storage. */
  gallery?: string[]
  /** Música de fundo — link direto (ou upload) de um arquivo de áudio. */
  music_url?: string
  /** Metadados do player estilo Spotify. */
  music_title?: string
  music_artist?: string
  /** Capa da música (URL/Storage). */
  music_cover?: string
  /** Presentes/PIX */
  pix_key?: string
  pix_name?: string
  pix_city?: string
  gift_message?: string
  /** Link externo de lista de presentes (opcional). */
  gift_url?: string
  /** Lista de presentes (itens cadastrados pelo anfitrião). */
  gift_items?: { name: string; price?: string }[]
  /** Altura das fotos do carrossel (px). */
  gallery_height?: number
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

// ── Painel do administrador ──
export type AdminStats = {
  invites: number
  published: number
  drafts: number
  rsvps: number
  views: number
  users: number
}
export type AdminInviteRow = {
  id: string
  title: string
  slug: string
  status: InviteStatus
  views: number
  created_at: string
  owner_email: string | null
}
export type AdminUserRow = {
  id: string
  email: string | null
  created_at: string
  invites: number
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
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      admin_stats: {
        Args: Record<string, never>
        Returns: AdminStats
      }
      admin_invites: {
        Args: Record<string, never>
        Returns: AdminInviteRow[]
      }
      admin_users: {
        Args: Record<string, never>
        Returns: AdminUserRow[]
      }
      admin_admins: {
        Args: Record<string, never>
        Returns: string[]
      }
      admin_add_admin: {
        Args: { p_email: string }
        Returns: undefined
      }
      admin_remove_admin: {
        Args: { p_email: string }
        Returns: undefined
      }
      admin_set_invite_status: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
      admin_delete_invite: {
        Args: { p_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
  }
}
