# Invitly 🎉

SaaS de **convites digitais animados** — crie, personalize, compartilhe por link e receba confirmações de presença (RSVP).

Stack: **React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + Supabase + TanStack Query + react-i18next (PT-BR/EN)**.

---

## ⚠️ Estado atual (Fase 1)

A estrutura do projeto está pronta, mas **as dependências ainda não foram instaladas**.
Antes de rodar, é preciso instalar os pacotes (passo abaixo). Só depois disso o `npm run dev` funciona.

### Próximo passo ao retomar

```bash
# 1) Instalar dependências de runtime
npm install @supabase/supabase-js @tanstack/react-query react-router-dom \
  react-i18next i18next i18next-browser-languagedetector \
  react-hook-form @hookform/resolvers zod \
  class-variance-authority clsx tailwind-merge lucide-react \
  @radix-ui/react-slot @radix-ui/react-label

# 2) Instalar dependências de dev (Tailwind v4)
npm install -D tailwindcss @tailwindcss/vite tw-animate-css

# 3) Rodar
npm run dev
```

> Depois de instalar, rode `npm run build` para checar os tipos (tsc) antes de seguir.

---

## Configuração do ambiente

```bash
cp .env.example .env
```

Preencha pelo menos `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (do painel do Supabase)
para habilitar login/cadastro. Sem essas variáveis, o app roda mas a tela de login
mostra um aviso e o auth fica desabilitado.

As migrations SQL estão em [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) —
rode no SQL Editor do Supabase (ou via CLI) para criar as tabelas `invites`, `rsvp`,
`invite_views` e as políticas de RLS.

---

## O que já está feito ✅

- Scaffold Vite + React 19 + TS, alias `@/*`, Tailwind v4 + tokens da marca
- Componentes base shadcn/ui: `button`, `card`, `input`, `label`
- Cliente Supabase com fallback seguro quando não configurado
- `AuthProvider` + `useAuth` + `ProtectedRoute` (sessão, login, cadastro, Google, logout)
- Rotas (React Router) com todas as páginas do produto
- **Landing page** completa (hero, como funciona, templates, preços, FAQ, CTA, footer)
- **Login/Cadastro** funcional (React Hook Form + Zod)
- **Dashboard** com estado vazio
- i18n PT-BR + EN com seletor de idioma
- Migrations SQL + RLS

## O que vem depois (Fases 2–4)

- Fase 2: sistema de templates, editor drag-and-drop, página pública animada, RSVP
- Fase 3: integração Kiwify (checkout + webhook), status do convite, e-mail pós-pagamento
- Fase 4: dashboard com analytics (Recharts), Animate UI, IA (sugestão de texto), deploy

Spec completa em [`docs/saas-convites-prompt.md`](docs/saas-convites-prompt.md).

---

## Estrutura

```
src/
  components/      ui/ (shadcn), landing helpers, ProtectedRoute, LanguageToggle
  context/         AuthProvider + contexto de auth
  hooks/           useAuth, useInView
  lib/             supabase, i18n, categories, utils
  locales/         pt-BR/ e en/ (common.json)
  pages/           Landing, Login, Dashboard, Editor, Checkout, PublicInvite, Rsvp, GuestList, NotFound
  types/           tipos do banco e do domínio
supabase/
  migrations/      0001_init.sql (tabelas + RLS)
```
