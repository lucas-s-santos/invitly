// Fontes disponíveis no editor. O `css` vai direto em font-family.
// (As famílias são carregadas no index.html.)

export interface FontOption {
  label: string
  css: string
}

export const FONT_OPTIONS: FontOption[] = [
  { label: "Clássica", css: '"Playfair Display", serif' },
  { label: "Elegante", css: '"Cormorant Garamond", serif' },
  { label: "Moderna", css: '"Montserrat", sans-serif' },
  { label: "Limpa", css: '"Poppins", sans-serif' },
  { label: "Manuscrita", css: '"Dancing Script", cursive' },
  { label: "Romântica", css: '"Great Vibes", cursive' },
  { label: "Divertida", css: '"Pacifico", cursive' },
  { label: "Descontraída", css: '"Caveat", cursive' },
]
