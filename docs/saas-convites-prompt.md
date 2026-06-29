# 🎉 PROMPT COMPLETO — SaaS de Convites Online (Claude Code)

> Cole este prompt diretamente no Claude Code para iniciar o projeto.

---

## CONTEXTO DO PROJETO

Você vai construir um SaaS completo chamado **InviteFlow** — uma plataforma onde qualquer pessoa pode criar convites digitais animados para festas e eventos, pagar por convite criado, e compartilhar via link público.

---

## STACK TÉCNICA

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| UI Components | shadcn/ui + Tailwind CSS |
| Animações | Animate UI (animate-ui.com) |
| Backend/Auth | Supabase (Auth + PostgreSQL + Storage) |
| Pagamento | Kiwify (webhook de confirmação) |
| IA | Anthropic Claude API (sugestão de texto) |
| i18n | react-i18next (PT-BR + EN) |
| Deploy | Vercel |

---

## ESTRUTURA DE PÁGINAS E ROTAS

```
/                        → Landing Page (marketing)
/login                   → Login / Cadastro (Supabase Auth)
/dashboard               → Meus Convites (lista + analytics)
/editor/novo             → Seleção de template
/editor/:id              → Editor drag-and-drop do convite
/checkout/:id            → Pagamento via Kiwify
/convite/:slug           → Página pública do convite (animada)
/convite/:slug/rsvp      → Confirmação de presença
/convite/:slug/lista     → Lista de confirmados (só dono)
/admin                   → Painel admin (opcional fase 2)
```

---

## BANCO DE DADOS — SUPABASE

### Tabela: `users` (gerenciada pelo Supabase Auth)
- id, email, name, avatar_url, created_at

### Tabela: `invites`
```sql
id            uuid PRIMARY KEY
user_id       uuid REFERENCES auth.users
slug          text UNIQUE NOT NULL         -- URL pública: /convite/festa-joao-2025
title         text NOT NULL
category      text NOT NULL               -- casamento, aniversario_infantil, etc.
template_id   text NOT NULL
status        text DEFAULT 'draft'        -- draft | paid | published | expired
data          jsonb NOT NULL              -- todos os campos customizados
views         integer DEFAULT 0
created_at    timestamptz DEFAULT now()
expires_at    timestamptz
payment_id    text                        -- ID retornado pelo Kiwify
```

### Tabela: `rsvp`
```sql
id            uuid PRIMARY KEY
invite_id     uuid REFERENCES invites
name          text NOT NULL
email         text
phone         text
status        text DEFAULT 'confirmed'    -- confirmed | declined | maybe
guests_count  integer DEFAULT 1
message       text
created_at    timestamptz DEFAULT now()
```

### Tabela: `invite_views`
```sql
id            uuid PRIMARY KEY
invite_id     uuid REFERENCES invites
viewed_at     timestamptz DEFAULT now()
ip_hash       text                        -- anonimizado
device        text                        -- mobile | desktop
```

---

## MODELO DE NEGÓCIO — PAY PER USE (KIWIFY)

### Fluxo de pagamento:
1. Usuário cria e personaliza o convite no editor (rascunho grátis)
2. Clica em "Publicar convite" → vai para `/checkout/:id`
3. Página de checkout mostra resumo + botão "Pagar com Kiwify"
4. Redireciona para link de produto Kiwify com `?ref=invite_id` no URL
5. Kiwify dispara webhook POST para `/api/webhooks/kiwify`
6. Backend valida a assinatura do webhook, muda `status` para `paid` e `published`
7. Usuário recebe email de confirmação e link do convite ativo

### Precificação sugerida (configurável via `.env`):
- Convite Básico: R$ 9,90 (1 template, sem animações premium)
- Convite Premium: R$ 19,90 (todos os templates, animações, analytics)
- Pack 5 Convites: R$ 39,90 (desconto)

### Webhook endpoint (`/api/webhooks/kiwify`):
```typescript
// Validar header X-Kiwify-Signature (HMAC-SHA256)
// Extrair invite_id do campo metadata ou ref
// UPDATE invites SET status='published', payment_id=... WHERE id=invite_id
// Enviar email de confirmação (Supabase Edge Function ou Resend)
```

---

## CATEGORIAS E TEMPLATES

Crie ao menos 2 templates por categoria no lançamento:

| Categoria | ID | Paleta sugerida |
|---|---|---|
| Casamento | `wedding` | Branco, champagne, ouro |
| Aniversário Infantil | `birthday_kids` | Cores vivas, balões, confete |
| Aniversário Adulto | `birthday_adult` | Escuro, elegante, dourado |
| Formatura | `graduation` | Azul marinho, dourado, toga |
| Chá de Bebê / Revelação | `baby_shower` | Rosa/azul pastel, delicado |
| Festa Junina | `festa_junina` | Vermelho, amarelo, xadrez |
| Halloween | `halloween` | Laranja, preto, roxo |
| Natal / Ano Novo | `christmas` | Vermelho, verde, dourado |
| Corporativo | `corporate` | Azul, cinza, branco |

### Estrutura de um template (JSON):
```typescript
interface Template {
  id: string
  category: string
  name: string
  thumbnail: string          // URL da preview
  isPremium: boolean
  fields: TemplateField[]    // campos editáveis
  animations: Animation[]    // animações do Animate UI
  defaultData: Record<string, any>
}

interface TemplateField {
  key: string               // ex: "groom_name"
  label: string             // ex: "Nome do noivo"
  type: 'text' | 'date' | 'time' | 'color' | 'image' | 'textarea'
  required: boolean
  maxLength?: number
}
```

---

## EDITOR — DRAG AND DROP

Use `@dnd-kit/core` para o editor. O editor deve ter:

### Painel Esquerdo — Propriedades:
- Campos de texto (nome, data, local, hora, mensagem)
- Seletor de cores (primária, secundária, fundo)
- Upload de foto de fundo (Supabase Storage)
- Seletor de fonte (Google Fonts: 8 opções curadas por categoria)
- Toggle de animações (ativar/desativar efeitos)
- Botão "✨ Sugerir texto com IA"

### Centro — Preview ao vivo:
- Renderização em tempo real do convite
- Botão para alternar preview Mobile / Desktop
- Régua com guides (opcional)

### Painel Direito — Layers/Elementos:
- Lista de elementos do template
- Reordenar via drag-and-drop
- Mostrar/ocultar elemento

### Barra Superior:
- Botão "Salvar rascunho" (auto-save a cada 30s)
- Botão "Preview público"
- Botão "Publicar" → abre modal de checkout

---

## FEATURE: IA PARA SUGESTÃO DE TEXTO

Endpoint serverless (Vite + Supabase Edge Functions):

```typescript
// POST /api/ai/suggest-text
// Body: { category, fields, language }

const systemPrompt = `Você é um especialista em criar textos para convites de festas.
Crie um texto bonito, emotivo e adequado para a categoria informada.
Responda APENAS com JSON no formato: { "title": "...", "message": "...", "tagline": "..." }
Idioma: ${language === 'pt' ? 'Português do Brasil' : 'English'}
`

// Chamar Claude API com claude-sonnet-4-6
// Retornar sugestões de título, mensagem e tagline
// Limitar a 3 chamadas por convite (controle via Supabase)
```

---

## ANIMAÇÕES — ANIMATE UI

Instale via: `pnpm dlx shadcn@latest add @animate-ui/primitives-texts-sliding-number`

### Animações por tipo de evento:
- **Casamento**: fade-in suave, partículas de pétalas, texto em reveal lento
- **Aniversário infantil**: confete explodindo, balões subindo, bounce nos elementos
- **Halloween**: névoa, texto tremendo, aparição gradual
- **Corporativo**: slide-in profissional, sem excessos
- **Revelação**: cortina abrindo, explosão de cor (rosa ou azul)

### Componentes Animate UI a usar:
```
@animate-ui/primitives-texts-sliding-number  → contagem regressiva
@animate-ui/primitives-fade-in               → entrada dos elementos
@animate-ui/primitives-blur-in               → fundo desfocado
@animate-ui/primitives-typewriter            → texto digitando (convites corporativos)
@animate-ui/primitives-confetti             → aniversário / chá revelação
```

---

## PÁGINA PÚBLICA DO CONVITE (`/convite/:slug`)

Esta é a página mais importante — o produto que o cliente comprou.

### Estrutura:
1. **Animação de entrada** — 2-3 segundos de intro animada
2. **Conteúdo do convite** — template renderizado com os dados
3. **Contagem regressiva** — dias/horas até o evento (Animate UI sliding number)
4. **Botão RSVP** — "Confirmar presença" abre modal
5. **Botão Compartilhar** — copia link, abre WhatsApp Web
6. **Footer discreto** — "Criado com InviteFlow" (branding gratuito)

### Meta tags para compartilhamento:
```html
<meta property="og:title" content="Você foi convidado! — {event_name}" />
<meta property="og:description" content="{tagline}" />
<meta property="og:image" content="{thumbnail_url}" />
<meta property="og:url" content="https://inviteflow.com.br/convite/{slug}" />
```

---

## DASHBOARD DO USUÁRIO

### Visão geral:
- Cards com cada convite criado (thumb, nome, status, visualizações)
- Filtros: Todos | Rascunho | Publicado | Expirado
- Botão "Criar novo convite"

### Analytics por convite:
- Total de visualizações
- Gráfico de views por dia (últimos 7 dias) — use Recharts
- Total de confirmações RSVP
- Taxa de conversão (views → RSVP)
- Lista de confirmados (nome, quantidade de pessoas, mensagem)

---

## LANDING PAGE (MARKETING)

A landing page deve ser impactante e converter visitantes em usuários. Seções:

1. **Hero** — Headline forte + preview animado de um convite demo + CTA "Criar meu convite grátis"
2. **Como funciona** — 3 passos: Escolha o template → Personalize → Compartilhe
3. **Templates em destaque** — Grid com 6 templates animados ao hover
4. **Social proof** — Contador de convites criados (animado com Animate UI)
5. **Depoimentos** — 3 cards de usuários fictícios para o lançamento
6. **Preços** — Cards de preço claros com toggle PT/EN
7. **FAQ** — Accordion com 6 perguntas frequentes
8. **CTA Final** — Banner com gradiente + botão grande

### Design da Landing:
- Fonte display: **Playfair Display** (elegância + festa)
- Fonte body: **DM Sans** (limpeza moderna)
- Paleta: `#1a0533` (roxo escuro), `#ff6b9d` (rosa vibrante), `#ffd700` (dourado), `#ffffff`
- Fundo: gradiente escuro com partículas sutis (Animate UI)
- Vibe: premium, festivo, mas não infantil

---

## INTERNACIONALIZAÇÃO (i18n)

Use `react-i18next`. Estrutura de arquivos:
```
src/
  locales/
    pt-BR/
      common.json
      landing.json
      editor.json
      dashboard.json
    en/
      common.json
      landing.json
      editor.json
      dashboard.json
```

Toggle de idioma no header (bandeirinha BR / EN).

---

## VARIÁVEIS DE AMBIENTE

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Kiwify
KIWIFY_WEBHOOK_SECRET=
KIWIFY_PRODUCT_ID_BASIC=
KIWIFY_PRODUCT_ID_PREMIUM=
KIWIFY_PRODUCT_ID_PACK=

# Anthropic (IA)
ANTHROPIC_API_KEY=

# App
VITE_APP_URL=https://inviteflow.com.br
VITE_APP_NAME=InviteFlow
```

---

## ESTRUTURA DE PASTAS DO PROJETO

```
inviteflow/
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── editor/              # Editor drag-and-drop
│   │   ├── invite/              # Renderização do convite
│   │   ├── dashboard/           # Cards, analytics
│   │   └── landing/             # Seções da landing
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Editor.tsx
│   │   ├── Checkout.tsx
│   │   ├── PublicInvite.tsx
│   │   └── RSVP.tsx
│   ├── lib/
│   │   ├── supabase.ts          # Cliente Supabase
│   │   ├── templates.ts         # Registry de templates
│   │   ├── analytics.ts         # Track de views
│   │   └── ai.ts                # Claude API calls
│   ├── hooks/
│   │   ├── useInvite.ts
│   │   ├── useRSVP.ts
│   │   └── useAnalytics.ts
│   ├── locales/                 # Arquivos i18n
│   ├── types/                   # TypeScript types
│   └── styles/
│       └── globals.css
├── supabase/
│   ├── migrations/              # SQL migrations
│   └── functions/               # Edge Functions
│       ├── kiwify-webhook/
│       └── send-email/
├── public/
│   └── templates/               # Thumbnails dos templates
├── .env.example
├── vite.config.ts
└── README.md
```

---

## ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

Siga esta ordem para ter algo funcionando rápido:

### Fase 1 — Base (Semana 1)
1. Setup Vite + React + TypeScript + Tailwind + shadcn/ui
2. Integração Supabase (Auth + banco)
3. Migrations SQL (tabelas acima)
4. Rotas com React Router
5. Login/cadastro funcional
6. Landing page estática

### Fase 2 — Core (Semana 2)
7. Sistema de templates (pelo menos 2 por categoria)
8. Editor básico (campos de texto + preview)
9. Página pública do convite animada
10. RSVP funcional

### Fase 3 — Monetização (Semana 3)
11. Integração Kiwify (link de pagamento + webhook)
12. Controle de status do convite
13. Email de confirmação pós-pagamento

### Fase 4 — Polimento (Semana 4)
14. Dashboard com analytics (Recharts)
15. Animate UI em todos os templates
16. Feature de IA (sugestão de texto)
17. i18n PT-BR + EN
18. Deploy Vercel + domínio

---

## COMANDO PARA INICIAR

```bash
npm create vite@latest inviteflow -- --template react-ts
cd inviteflow
npm install
npm install @supabase/supabase-js @tanstack/react-query react-router-dom
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-i18next i18next
npm install recharts
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react
npx shadcn@latest init
npx shadcn@latest add button card dialog input label select textarea toast tabs badge avatar
```

---

## NOTAS FINAIS

- O editor deve **salvar automaticamente** a cada 30 segundos no Supabase
- O slug do convite deve ser **gerado automaticamente** a partir do nome do evento + ano
- A página pública deve ser **ultra rápida** (SSG via Vercel se possível)
- O QR Code deve ser gerado com a lib `qrcode.react` e disponível após o pagamento
- Rastreamento de views deve ser **anonimizado** (só hash do IP, sem dados pessoais)
- Respeitar **LGPD**: aviso de cookies, política de privacidade, opção de deletar conta

---

*Prompt gerado para Claude Code — InviteFlow SaaS — v1.0*
