// Fundos prontos por categoria — o usuário pode trocar no editor depois de
// escolher a ocasião. O primeiro de cada lista é o padrão do template.

export type BgOption = { img: string; overlay: number; textDark?: boolean }

export const CATEGORY_BACKGROUNDS: Record<string, BgOption[]> = {
  wedding: [
    { img: "/templates/wedding.jpg", overlay: 30 },
    { img: "/templates/flores.jpg", overlay: 8, textDark: true },
    { img: "/templates/casamento-2.jpg", overlay: 8, textDark: true },
  ],
  birthday_kids: [
    { img: "/templates/birthday-kids.jpg", overlay: 16, textDark: true },
    { img: "/templates/aniversario-2.jpg", overlay: 10, textDark: true },
  ],
  birthday_adult: [
    { img: "/templates/birthday-adult.jpg", overlay: 46 },
    { img: "/templates/birthday-adult-2.jpg", overlay: 40 },
    { img: "/templates/aniversario-2.jpg", overlay: 10, textDark: true },
  ],
  baby_shower: [
    { img: "/templates/baby.jpg", overlay: 10, textDark: true },
    { img: "/templates/bebe-2.jpg", overlay: 8, textDark: true },
  ],
  graduation: [
    { img: "/templates/graduation.jpg", overlay: 8, textDark: true },
    { img: "/templates/formatura-2.jpg", overlay: 10, textDark: true },
  ],
  christmas: [
    { img: "/templates/christmas.jpg", overlay: 8, textDark: true },
    { img: "/templates/natal-2.jpg", overlay: 10, textDark: true },
    { img: "/templates/natal-3.jpg", overlay: 10, textDark: true },
  ],
  festa_junina: [
    { img: "/templates/festa-junina.jpg", overlay: 8, textDark: true },
    { img: "/templates/junina-2.jpg", overlay: 10, textDark: true },
  ],
  halloween: [
    { img: "/templates/halloween.jpg", overlay: 42 },
    { img: "/templates/halloween-2.jpg", overlay: 40 },
  ],
  corporate: [
    { img: "/templates/corporate.jpg", overlay: 8, textDark: true },
    { img: "/templates/corporate-2.jpg", overlay: 8, textDark: true },
  ],
}

export function backgroundsForCategory(category: string): BgOption[] {
  return CATEGORY_BACKGROUNDS[category] ?? []
}
