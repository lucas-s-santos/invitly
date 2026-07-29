// Fontes de título disponíveis no editor. O `css` vai direto em font-family.
// (As famílias são carregadas no index.html.)

export interface FontOption {
  label: string
  css: string
}

export const FONT_OPTIONS: FontOption[] = [
  { label: "Clássica", css: '"Playfair Display", serif' },
  { label: "Moderna", css: '"Montserrat", sans-serif' },
  { label: "Suave", css: '"DM Sans", sans-serif' },
  { label: "Manuscrita", css: '"Dancing Script", cursive' },
]
