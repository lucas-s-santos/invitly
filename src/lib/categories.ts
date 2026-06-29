import type { InviteCategory } from "@/types"

/** Categorias de evento suportadas no lançamento (ver docs/saas-convites-prompt.md). */
export const CATEGORIES: InviteCategory[] = [
  {
    id: "wedding",
    labelKey: "categories.wedding",
    emoji: "💍",
    palette: ["#ffffff", "#f3e9d2", "#d4af37"],
  },
  {
    id: "birthday_kids",
    labelKey: "categories.birthday_kids",
    emoji: "🎈",
    palette: ["#ff6b9d", "#ffd166", "#06d6a0"],
  },
  {
    id: "birthday_adult",
    labelKey: "categories.birthday_adult",
    emoji: "🥂",
    palette: ["#1a0533", "#d4af37", "#2a1149"],
  },
  {
    id: "graduation",
    labelKey: "categories.graduation",
    emoji: "🎓",
    palette: ["#0b1f3a", "#d4af37", "#ffffff"],
  },
  {
    id: "baby_shower",
    labelKey: "categories.baby_shower",
    emoji: "👶",
    palette: ["#ffd1dc", "#bde0fe", "#ffffff"],
  },
  {
    id: "festa_junina",
    labelKey: "categories.festa_junina",
    emoji: "🌽",
    palette: ["#d62828", "#fcbf49", "#003049"],
  },
  {
    id: "halloween",
    labelKey: "categories.halloween",
    emoji: "🎃",
    palette: ["#ff7518", "#0d0d0d", "#6a0dad"],
  },
  {
    id: "christmas",
    labelKey: "categories.christmas",
    emoji: "🎄",
    palette: ["#c1121f", "#2a9d8f", "#d4af37"],
  },
  {
    id: "corporate",
    labelKey: "categories.corporate",
    emoji: "🏢",
    palette: ["#1d3557", "#a8dadc", "#ffffff"],
  },
]

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id)
