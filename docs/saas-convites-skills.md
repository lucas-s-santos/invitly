# 🛠️ SKILLS PERFEITAS — SaaS InviteFlow

Guia de todas as tecnologias e bibliotecas que você precisa dominar para construir o SaaS de convites com Claude Code.

---

## 1. ANIMATE UI — Animações do Sistema

**Site**: animate-ui.com  
**Por que usar**: É baseado em shadcn/ui (mesmo modelo de instalação) e roda com Framer Motion por baixo. Perfeito para as animações dos convites e da landing page.

### Instalação:
```bash
# Inicializar shadcn primeiro (se ainda não fez)
pnpm dlx shadcn@latest init

# Adicionar componentes do Animate UI
pnpm dlx shadcn@latest add @animate-ui/primitives-fade-in
pnpm dlx shadcn@latest add @animate-ui/primitives-blur-in
pnpm dlx shadcn@latest add @animate-ui/primitives-texts-sliding-number
pnpm dlx shadcn@latest add @animate-ui/primitives-typewriter
```

### Onde usar no projeto:
| Componente Animate UI | Onde no SaaS |
|---|---|
| `FadeIn` | Entrada de todos os elementos do convite |
| `BlurIn` | Fundo desfocado no hero da landing |
| `SlidingNumber` | Contagem regressiva até o evento |
| `Typewriter` | Texto do convite corporativo "digitando" |
| `Confetti` | Aniversário e chá revelação |

---

## 2. SHADCN/UI — Componentes de Interface

**Site**: ui.shadcn.com  
**Por que usar**: Componentes acessíveis, totalmente customizáveis, integrados com Tailwind. Base do editor e dashboard.

### Componentes essenciais para o projeto:
```bash
npx shadcn@latest add button card dialog input label
npx shadcn@latest add select textarea toast tabs badge
npx shadcn@latest add avatar dropdown-menu sheet slider
npx shadcn@latest add accordion separator progress
npx shadcn@latest add popover color-picker tooltip
```

### Onde cada um é usado:
- **Dialog** → Modal de RSVP, modal de pagamento
- **Sheet** → Painel lateral do editor (mobile)
- **Accordion** → FAQ na landing page
- **Tabs** → Alternar campos no editor
- **Toast** → Feedback de salvo, erro, copiado
- **Slider** → Tamanho da fonte no editor

---

## 3. SUPABASE — Backend Completo

**Site**: supabase.com  
**Por que usar**: Auth, banco PostgreSQL, Storage (fotos), Edge Functions (webhooks) e Realtime — tudo num só lugar.

### Setup:
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react  # helpers para React
```

### Módulos do Supabase usados no projeto:
| Módulo | Para quê |
|---|---|
| **Auth** | Login/cadastro (email, Google OAuth) |
| **PostgreSQL** | Tabelas: invites, rsvp, invite_views |
| **Storage** | Upload de fotos de fundo dos convites |
| **Edge Functions** | Receber webhook do Kiwify, enviar emails |
| **Row Level Security** | Cada usuário vê só seus próprios convites |

### RLS (Row Level Security) obrigatório:
```sql
-- Usuário só vê seus próprios convites
CREATE POLICY "Users see own invites" ON invites
  FOR ALL USING (auth.uid() = user_id);

-- Qualquer um pode ver convites publicados (página pública)
CREATE POLICY "Public can view published invites" ON invites
  FOR SELECT USING (status = 'published');

-- Qualquer um pode criar RSVP
CREATE POLICY "Anyone can create RSVP" ON rsvp
  FOR INSERT WITH CHECK (true);
```

---

## 4. DND-KIT — Editor Drag and Drop

**Site**: dndkit.com  
**Por que usar**: O mais leve e acessível drag-and-drop para React. Sem dependência de jQuery ou legado.

### Instalação:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### O que fazer com ele no editor:
- Reordenar layers/elementos do convite
- Mover blocos de texto na preview
- Reorganizar seções do convite

```tsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

// Envolva a lista de layers no editor com DndContext
```

---

## 5. REACT HOOK FORM + ZOD — Formulários e Validação

**Por que usar**: O editor tem muitos campos (texto, data, cor, imagem). RHF evita re-renders desnecessários. Zod garante tipagem e validação.

### Instalação:
```bash
npm install react-hook-form @hookform/resolvers zod
```

### Uso no editor:
```tsx
const inviteSchema = z.object({
  title: z.string().min(3).max(100),
  event_date: z.date(),
  location: z.string().min(3),
  message: z.string().max(500).optional(),
})

const form = useForm<z.infer<typeof inviteSchema>>({
  resolver: zodResolver(inviteSchema),
})
```

---

## 6. TANSTACK QUERY — Gerenciamento de Estado Servidor

**Por que usar**: Substitui useEffect + fetch manual. Cache automático, loading states, refetch, mutations.

### Instalação:
```bash
npm install @tanstack/react-query
```

### Queries principais:
```tsx
// Buscar convite para editar
const { data: invite } = useQuery({
  queryKey: ['invite', id],
  queryFn: () => fetchInvite(id),
})

// Salvar convite (mutation)
const { mutate: saveInvite } = useMutation({
  mutationFn: updateInvite,
  onSuccess: () => toast({ title: "Salvo!" }),
})
```

---

## 7. RECHARTS — Gráficos do Dashboard

**Por que usar**: Biblioteca de gráficos mais usada com React. Fácil de integrar com dados do Supabase.

### Instalação:
```bash
npm install recharts
```

### Gráfico de views por dia:
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

<LineChart data={viewsData}>
  <Line type="monotone" dataKey="views" stroke="#ff6b9d" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
</LineChart>
```

---

## 8. QRCODE.REACT — QR Code do Convite

### Instalação:
```bash
npm install qrcode.react
```

### Uso:
```tsx
import { QRCodeSVG } from 'qrcode.react'

<QRCodeSVG
  value={`https://inviteflow.com.br/convite/${slug}`}
  size={200}
  fgColor="#1a0533"
/>
```

---

## 9. REACT-I18NEXT — Internacionalização PT-BR + EN

### Instalação:
```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### Setup rápido:
```tsx
// src/lib/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ptBR from '../locales/pt-BR/common.json'
import en from '../locales/en/common.json'

i18n.use(initReactI18next).init({
  resources: { 'pt-BR': { translation: ptBR }, en: { translation: en } },
  lng: 'pt-BR',
  fallbackLng: 'en',
})
```

---

## 10. ANTHROPIC SDK — IA para Sugestão de Texto

### Instalação (no backend / Edge Function):
```bash
npm install @anthropic-ai/sdk
```

### Chamada para sugerir texto do convite:
```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 300,
  messages: [{
    role: 'user',
    content: `Crie um texto para um convite de ${category}.
    Dados: nome=${name}, data=${date}, local=${location}.
    Responda APENAS em JSON: {"title":"...","message":"...","tagline":"..."}`
  }]
})
```

---

## RESUMO — Ordem de aprendizado/configuração

```
1. Supabase     → Auth + banco + storage (fundação)
2. shadcn/ui    → Componentes base do sistema
3. Animate UI   → Animações dos templates e landing
4. DND-Kit      → Editor drag-and-drop
5. RHF + Zod    → Formulários do editor
6. TanStack Query → Queries e mutations
7. Recharts     → Dashboard analytics
8. qrcode.react → QR Code
9. i18next      → PT-BR + EN
10. Anthropic SDK → IA no backend
```

---

## DICA FINAL — Claude Code

Ao iniciar no Claude Code, cole o prompt principal (`saas-convites-prompt.md`) e adicione no início:

> "Leia e siga o prompt abaixo para criar o SaaS InviteFlow. Comece pela Fase 1 (Setup + Supabase + Landing). Me mostre o progresso a cada etapa concluída."

Isso garante que o Claude Code avance por partes sem tentar fazer tudo de uma vez.

---

*Skills guide — InviteFlow SaaS — v1.0*
