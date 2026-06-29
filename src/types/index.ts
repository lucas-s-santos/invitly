import type { InviteFields } from "./database"

export type {
  Invite,
  InviteData,
  InviteFields,
  InviteStatus,
  InviteView,
  Rsvp,
  RsvpStatus,
  DeviceType,
  Database,
} from "./database"

export type TemplateFieldType =
  | "text"
  | "date"
  | "time"
  | "color"
  | "image"
  | "textarea"

export interface TemplateField {
  key: string
  label: string
  type: TemplateFieldType
  required: boolean
  maxLength?: number
}

export interface TemplateAnimation {
  /** ex: "fade-in", "confetti", "typewriter" */
  type: string
  /** chave do campo/elemento alvo, quando aplicável */
  target?: string
}

export type TemplateLayout = "centered" | "elegant" | "playful"

/** Aparência do convite — o InviteRenderer interpreta esses tokens. */
export interface TemplateStyle {
  /** CSS de fundo (cor sólida ou gradiente) */
  background: string
  textColor: string
  accentColor: string
  mutedColor: string
  /** família da fonte de título (display) */
  fontDisplay: string
  layout: TemplateLayout
  /** emoji decorativo opcional usado na intro/preview */
  motif?: string
}

export interface Template {
  id: string
  category: string
  name: string
  thumbnail: string
  isPremium: boolean
  fields: TemplateField[]
  animations: TemplateAnimation[]
  style: TemplateStyle
  defaultData: InviteFields
}

export interface InviteCategory {
  /** id usado em invites.category e nos templates */
  id: string
  /** chave i18n do nome amigável */
  labelKey: string
  emoji: string
  /** paleta sugerida (hex) para preview */
  palette: string[]
}
