import type { InviteFields, Template, TemplateField, TemplateStyle } from "@/types"

/** Campos editáveis — compartilhados por todos os templates. */
export const STANDARD_FIELDS: TemplateField[] = [
  { key: "title", label: "Título do evento", type: "text", required: true, maxLength: 80 },
  { key: "hosts", label: "Anfitriões / Nomes", type: "text", required: false, maxLength: 80 },
  { key: "event_date", label: "Data", type: "date", required: true },
  { key: "event_time", label: "Horário", type: "time", required: false },
  { key: "location", label: "Local", type: "text", required: false, maxLength: 120 },
  { key: "message", label: "Mensagem", type: "textarea", required: false, maxLength: 400 },
]

interface Variant {
  suffix: string
  name: string
  isPremium: boolean
  style: TemplateStyle
}

interface CategoryConfig {
  category: string
  defaults: InviteFields
  animations: string[]
  variants: [Variant, Variant]
}

const PLAYFAIR = "'Playfair Display', serif"
const DMSANS = "'DM Sans', sans-serif"

const CONFIGS: CategoryConfig[] = [
  {
    category: "wedding",
    animations: ["fade-in", "petals"],
    defaults: {
      title: "Nosso Casamento",
      hosts: "João & Maria",
      event_date: "2026-12-12",
      event_time: "16:00",
      location: "Espaço Jardim das Flores — São Paulo, SP",
      message:
        "Com imensa alegria, convidamos você para celebrar conosco o início da nossa história a dois.",
    },
    variants: [
      {
        suffix: "classico",
        name: "Clássico Champagne",
        isPremium: false,
        style: {
          background: "linear-gradient(160deg, #fbf7f0, #f3e9d2)",
          textColor: "#5a4a2f",
          accentColor: "#bfa14a",
          mutedColor: "#9b8a66",
          fontDisplay: PLAYFAIR,
          layout: "elegant",
          motif: "🤍",
        },
      },
      {
        suffix: "marmore",
        name: "Mármore & Ouro",
        isPremium: true,
        style: {
          background: "linear-gradient(160deg, #ffffff, #efe9f5)",
          textColor: "#2a2438",
          accentColor: "#c9a227",
          mutedColor: "#7a7290",
          fontDisplay: PLAYFAIR,
          layout: "centered",
          motif: "💍",
        },
      },
    ],
  },
  {
    category: "birthday_kids",
    animations: ["confetti", "bounce"],
    defaults: {
      title: "Festa da Lara!",
      hosts: "Lara faz 5 anos 🎉",
      event_date: "2026-08-15",
      event_time: "15:00",
      location: "Buffet Mundo Mágico — Rua das Crianças, 100",
      message: "Vem brincar, comer bolo e fazer a maior festa com a gente!",
    },
    variants: [
      {
        suffix: "balloons",
        name: "Balões Coloridos",
        isPremium: false,
        style: {
          background: "linear-gradient(160deg, #fff0f6, #e0f7ff)",
          textColor: "#c026a3",
          accentColor: "#ff6b9d",
          mutedColor: "#9a4d86",
          fontDisplay: DMSANS,
          layout: "playful",
          motif: "🎈",
        },
      },
      {
        suffix: "confetti",
        name: "Chuva de Confete",
        isPremium: true,
        style: {
          background: "linear-gradient(160deg, #fffbe6, #ffe9f0)",
          textColor: "#a3370a",
          accentColor: "#ffb703",
          mutedColor: "#b06a3c",
          fontDisplay: DMSANS,
          layout: "playful",
          motif: "🎉",
        },
      },
    ],
  },
  {
    category: "birthday_adult",
    animations: ["fade-in"],
    defaults: {
      title: "Meus 30!",
      hosts: "Rafael",
      event_date: "2026-09-20",
      event_time: "21:00",
      location: "Rooftop Lounge — Av. Paulista, 2000",
      message: "Bora celebrar mais um ano com muita música, drinks e boas histórias.",
    },
    variants: [
      {
        suffix: "noir",
        name: "Black & Gold",
        isPremium: false,
        style: {
          background: "linear-gradient(160deg, #1a0533, #2a1149)",
          textColor: "#f6f2fb",
          accentColor: "#ffd700",
          mutedColor: "#b6a9cc",
          fontDisplay: PLAYFAIR,
          layout: "elegant",
          motif: "🥂",
        },
      },
      {
        suffix: "neon",
        name: "Neon Night",
        isPremium: true,
        style: {
          background: "linear-gradient(160deg, #11071f, #3a0a4a)",
          textColor: "#fde7ff",
          accentColor: "#ff6b9d",
          mutedColor: "#c79ad6",
          fontDisplay: DMSANS,
          layout: "centered",
          motif: "✨",
        },
      },
    ],
  },
  {
    category: "graduation",
    animations: ["fade-in", "confetti"],
    defaults: {
      title: "Formatura 2026",
      hosts: "Camila — Engenharia",
      event_date: "2026-11-28",
      event_time: "19:30",
      location: "Centro de Convenções — Salão Nobre",
      message: "Anos de dedicação culminam nesta noite. Venha comemorar essa conquista comigo!",
    },
    variants: [
      {
        suffix: "navy",
        name: "Azul Marinho",
        isPremium: false,
        style: {
          background: "linear-gradient(160deg, #0b1f3a, #13315c)",
          textColor: "#eaf1ff",
          accentColor: "#d4af37",
          mutedColor: "#9fb3d1",
          fontDisplay: PLAYFAIR,
          layout: "elegant",
          motif: "🎓",
        },
      },
      {
        suffix: "ouro",
        name: "Toque de Ouro",
        isPremium: true,
        style: {
          background: "linear-gradient(160deg, #1c1c1c, #2e2a1a)",
          textColor: "#fff8e1",
          accentColor: "#e6c34a",
          mutedColor: "#c9bd92",
          fontDisplay: PLAYFAIR,
          layout: "centered",
          motif: "🏅",
        },
      },
    ],
  },
  {
    category: "baby_shower",
    animations: ["fade-in", "confetti"],
    defaults: {
      title: "Chá de Bebê",
      hosts: "Estamos esperando o Theo",
      event_date: "2026-07-10",
      event_time: "16:00",
      location: "Casa da vovó — Rua das Acácias, 45",
      message: "Venha celebrar a chegada do nosso pequeno com tarde de carinho e mimos.",
    },
    variants: [
      {
        suffix: "pastel",
        name: "Pastel Delicado",
        isPremium: false,
        style: {
          background: "linear-gradient(160deg, #eef6ff, #ffeef5)",
          textColor: "#5b6b86",
          accentColor: "#8fb8e8",
          mutedColor: "#9aa8c0",
          fontDisplay: DMSANS,
          layout: "playful",
          motif: "👶",
        },
      },
      {
        suffix: "reveal",
        name: "Chá Revelação",
        isPremium: true,
        style: {
          background: "linear-gradient(160deg, #ffe3ee, #dff0ff)",
          textColor: "#7a3b5d",
          accentColor: "#ff8fb1",
          mutedColor: "#b07f95",
          fontDisplay: DMSANS,
          layout: "centered",
          motif: "🎀",
        },
      },
    ],
  },
  {
    category: "festa_junina",
    animations: ["fade-in", "confetti"],
    defaults: {
      title: "Arraiá do Pedro",
      hosts: "Família Silva",
      event_date: "2026-06-24",
      event_time: "18:00",
      location: "Quintal da Vó Tereza — Sítio Boa Vista",
      message: "Bão dimais da conta, sô! Vem cair na quadrilha, comer pé-de-moleque e dançar muito!",
    },
    variants: [
      {
        suffix: "bandeirinhas",
        name: "Bandeirinhas",
        isPremium: false,
        style: {
          background: "linear-gradient(160deg, #fff3d6, #ffe0b0)",
          textColor: "#9c2a1a",
          accentColor: "#d62828",
          mutedColor: "#b5683c",
          fontDisplay: DMSANS,
          layout: "playful",
          motif: "🌽",
        },
      },
      {
        suffix: "fogueira",
        name: "Noite de Fogueira",
        isPremium: true,
        style: {
          background: "linear-gradient(160deg, #2b1407, #5c2a0e)",
          textColor: "#ffe7c2",
          accentColor: "#fcbf49",
          mutedColor: "#d6a877",
          fontDisplay: DMSANS,
          layout: "centered",
          motif: "🔥",
        },
      },
    ],
  },
  {
    category: "halloween",
    animations: ["blur-in", "flicker", "bats"],
    defaults: {
      title: "Noite do Terror",
      hosts: "Casa Assombrada dos Souza",
      event_date: "2026-10-31",
      event_time: "20:00",
      location: "Rua dos Sustos, 13",
      message: "Prepare sua fantasia mais aterrorizante... se tiver coragem de aparecer. 🦇",
    },
    variants: [
      {
        suffix: "abobora",
        name: "Abóbora & Sombras",
        isPremium: false,
        style: {
          background: "linear-gradient(160deg, #160a22, #3a1108)",
          textColor: "#ffd9a8",
          accentColor: "#ff7518",
          mutedColor: "#c79a6a",
          fontDisplay: PLAYFAIR,
          layout: "centered",
          motif: "🎃",
        },
      },
      {
        suffix: "roxo",
        name: "Roxo Macabro",
        isPremium: true,
        style: {
          background: "linear-gradient(160deg, #0d0d0d, #2a0a3a)",
          textColor: "#e9d5ff",
          accentColor: "#a855f7",
          mutedColor: "#a78bbf",
          fontDisplay: PLAYFAIR,
          layout: "elegant",
          motif: "🦇",
        },
      },
    ],
  },
  {
    category: "christmas",
    animations: ["fade-in", "snow"],
    defaults: {
      title: "Ceia de Natal",
      hosts: "Família Oliveira",
      event_date: "2026-12-24",
      event_time: "20:00",
      location: "Nossa casa — Rua do Pinheiro, 25",
      message: "Que tal celebrarmos juntos esta noite mágica? Te esperamos para a nossa ceia!",
    },
    variants: [
      {
        suffix: "vermelho",
        name: "Vermelho Clássico",
        isPremium: false,
        style: {
          background: "linear-gradient(160deg, #7a1220, #3d0a10)",
          textColor: "#fff4e0",
          accentColor: "#e6c34a",
          mutedColor: "#d3a98f",
          fontDisplay: PLAYFAIR,
          layout: "elegant",
          motif: "🎄",
        },
      },
      {
        suffix: "verde",
        name: "Verde Pinheiro",
        isPremium: true,
        style: {
          background: "linear-gradient(160deg, #0e3b2e, #08251c)",
          textColor: "#eafff4",
          accentColor: "#e8b923",
          mutedColor: "#9fc9b4",
          fontDisplay: PLAYFAIR,
          layout: "centered",
          motif: "❄️",
        },
      },
    ],
  },
  {
    category: "corporate",
    animations: ["typewriter", "slide-in"],
    defaults: {
      title: "Confraternização Anual",
      hosts: "Equipe Acme Corp",
      event_date: "2026-12-18",
      event_time: "19:00",
      location: "Auditório Sede — 12º andar",
      message: "Celebramos um ano de conquistas. Sua presença é fundamental nesta comemoração.",
    },
    variants: [
      {
        suffix: "azul",
        name: "Corporate Blue",
        isPremium: false,
        style: {
          background: "linear-gradient(160deg, #0f2740, #1d3557)",
          textColor: "#eaf2fb",
          accentColor: "#4ea8de",
          mutedColor: "#9fb6cf",
          fontDisplay: DMSANS,
          layout: "centered",
          motif: "🏢",
        },
      },
      {
        suffix: "minimal",
        name: "Minimal Cinza",
        isPremium: true,
        style: {
          background: "linear-gradient(160deg, #f7f8fa, #e9edf2)",
          textColor: "#1d2733",
          accentColor: "#2f6fed",
          mutedColor: "#6b7787",
          fontDisplay: DMSANS,
          layout: "centered",
          motif: "✦",
        },
      },
    ],
  },
]

function buildTemplate(cfg: CategoryConfig, variant: Variant): Template {
  return {
    id: `${cfg.category}-${variant.suffix}`,
    category: cfg.category,
    name: variant.name,
    thumbnail: "",
    isPremium: variant.isPremium,
    fields: STANDARD_FIELDS,
    animations: cfg.animations.map((type) => ({ type })),
    style: variant.style,
    defaultData: cfg.defaults,
  }
}

export const TEMPLATES: Template[] = CONFIGS.flatMap((cfg) =>
  cfg.variants.map((v) => buildTemplate(cfg, v)),
)

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: string): Template[] {
  return TEMPLATES.filter((t) => t.category === category)
}

/** Dados iniciais de um convite a partir do template. */
export function getTemplateDefaults(id: string): InviteFields | undefined {
  return getTemplate(id)?.defaultData
}
