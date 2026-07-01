export interface BackgroundPattern {
  id: string
  name: string
  /** CSS de fundo (gradiente) */
  css: string
  /** cor de texto sugerida para bom contraste */
  text: "light" | "dark"
}

/** Fundos prontos (gradientes CSS puros — sem imagens/licença). */
export const BACKGROUND_PATTERNS: BackgroundPattern[] = [
  { id: "blush", name: "Blush", css: "linear-gradient(160deg,#ffdde1,#ee9ca7)", text: "dark" },
  { id: "peach", name: "Pêssego", css: "linear-gradient(160deg,#ffecd2,#fcb69f)", text: "dark" },
  { id: "candy", name: "Algodão doce", css: "linear-gradient(160deg,#a8edea,#fed6e3)", text: "dark" },
  { id: "lavender", name: "Lavanda", css: "linear-gradient(160deg,#e0c3fc,#8ec5fc)", text: "dark" },
  { id: "mint", name: "Menta", css: "linear-gradient(160deg,#d9f8e8,#a8e6cf)", text: "dark" },
  { id: "gold", name: "Dourado", css: "linear-gradient(160deg,#f7f0d8,#d4af37)", text: "dark" },
  { id: "sunset", name: "Pôr do sol", css: "linear-gradient(160deg,#ff9a9e,#fad0c4)", text: "dark" },
  { id: "sky", name: "Céu", css: "linear-gradient(160deg,#c2e9fb,#a1c4fd)", text: "dark" },
  { id: "night", name: "Noite", css: "linear-gradient(160deg,#1a0533,#3a1a5e)", text: "light" },
  { id: "ocean", name: "Oceano", css: "linear-gradient(160deg,#2193b0,#6dd5ed)", text: "light" },
  { id: "berry", name: "Frutas", css: "linear-gradient(160deg,#7b4397,#dc2430)", text: "light" },
  { id: "forest", name: "Floresta", css: "linear-gradient(160deg,#0e3b2e,#2a9d8f)", text: "light" },
  { id: "wine", name: "Vinho", css: "linear-gradient(160deg,#7a1220,#3d0a10)", text: "light" },
  { id: "coal", name: "Carvão", css: "linear-gradient(160deg,#232526,#414345)", text: "light" },
]
