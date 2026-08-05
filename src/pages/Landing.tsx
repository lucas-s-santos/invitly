import { useEffect, useState, type CSSProperties } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crown,
  Palette,
  Share2,
  Sparkles,
  Star,
} from "lucide-react"

import { getTemplate, TEMPLATES } from "@/lib/templates"
import { CATEGORIES } from "@/lib/categories"
import { useAuth } from "@/hooks/useAuth"
import { loadGuestDraft } from "@/lib/guestDraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/LanguageToggle"
import { ThemeToggle } from "@/components/ThemeToggle"
import { BrandMark } from "@/components/BrandMark"
import { TemplatePreview } from "@/components/invite/TemplatePreview"

export default function Landing() {
  // Criar sem login: o CTA leva direto pra escolha de template (público)
  const ctaTo = "/editor/novo"

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar ctaTo={ctaTo} />
      <main className="flex-1">
        <Hero ctaTo={ctaTo} />
        <HowItWorks />
        <FeaturedTemplates ctaTo={ctaTo} />
        <Testimonials />
        <Pricing ctaTo={ctaTo} />
        <Faq />
        <FinalCta ctaTo={ctaTo} />
      </main>
      <Footer />
    </div>
  )
}

function Navbar({ ctaTo }: { ctaTo: string }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  // Voltar pro início não pode perder o convite montado sem conta.
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    if (user) {
      setHasDraft(false)
      return
    }
    let active = true
    void loadGuestDraft().then((d) => {
      if (active) setHasDraft(Boolean(d))
    })
    return () => {
      active = false
    }
  }, [user])

  const links = [
    { href: "#como-funciona", label: t("nav.howItWorks") },
    { href: "#templates", label: t("nav.templates") },
    { href: "#precos", label: t("nav.pricing") },
    { href: "#faq", label: t("nav.faq") },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label={t("brand")}>
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <LanguageToggle className="hidden sm:inline-flex" />
          <Button asChild variant="ghost" size="sm">
            <Link to={user ? "/dashboard" : "/login"}>
              {user ? t("nav.dashboard") : t("nav.login")}
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to={hasDraft ? "/criar/editor" : ctaTo}>
              {hasDraft ? "Continuar convite" : t("nav.createCta")}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

/** Um celular com um convite real na tela (moldura + máscara da tela). */
function Phone({ templateId, delay = 0 }: { templateId: string; delay?: number }) {
  const template = getTemplate(templateId)
  if (!template) return null
  return (
    <div
      className="relative aspect-[1000/1500] drop-shadow-2xl"
      style={{ animation: `invitly-float 6s ease-in-out ${delay}s infinite` }}
    >
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: "url(/hero-phone-mask.png)",
          maskImage: "url(/hero-phone-mask.png)",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      >
        <div
          className="absolute"
          style={{ left: "21%", top: "7%", width: "56%", height: "86%" }}
        >
          <TemplatePreview
            template={template}
            baseW={300}
            baseH={690}
            className="h-full w-full"
          />
        </div>
      </div>
      <img
        src="/hero-phone.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      />
    </div>
  )
}

/** Vitrine do hero: 3 celulares (maiores) flutuando + brilhos atrás. */
function HeroPhones() {
  const sparkle = (s: string): CSSProperties => ({
    animation: `invitly-float ${s} ease-in-out infinite`,
  })
  return (
    <div className="relative mx-auto h-[470px] w-full max-w-[500px] sm:h-[560px]">
      {/* Brilhos coloridos por trás (chamam atenção) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[6%] top-[6%] size-48 rounded-full bg-brand-gold/35 blur-3xl" />
        <div className="absolute right-[2%] top-[26%] size-52 rounded-full bg-primary/35 blur-3xl" />
        <div className="absolute bottom-[2%] left-[20%] size-48 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/15 blur-2xl" />
        {/* Faíscas */}
        <span
          className="absolute left-[14%] top-[22%] size-1.5 rounded-full bg-white/90 blur-[1px]"
          style={sparkle("4s")}
        />
        <span
          className="absolute right-[15%] top-[14%] size-2 rounded-full bg-brand-gold blur-[1px]"
          style={sparkle("5.2s")}
        />
        <span
          className="absolute right-[22%] bottom-[16%] size-1.5 rounded-full bg-white/80 blur-[1px]"
          style={sparkle("4.6s")}
        />
        <span
          className="absolute left-[24%] bottom-[24%] size-1 rounded-full bg-brand-gold blur-[1px]"
          style={sparkle("6s")}
        />
      </div>

      {/* traseiro esquerdo */}
      <div className="absolute left-0 top-[16%] w-[42%] -rotate-[9deg]">
        <Phone templateId="graduation-navy" delay={0.9} />
      </div>
      {/* traseiro direito */}
      <div className="absolute right-0 top-[11%] w-[42%] rotate-[9deg]">
        <Phone templateId="christmas-verde" delay={1.7} />
      </div>
      {/* frontal (centro, maior) */}
      <div className="absolute left-1/2 top-0 z-10 w-[54%] -translate-x-1/2">
        <Phone templateId="birthday_kids-confetti" delay={0.2} />
      </div>
    </div>
  )
}

function Hero({ ctaTo }: { ctaTo: string }) {
  const { t } = useTranslation()
  const title = t("hero.title")
  const highlight = t("hero.highlight")
  const hi = title.indexOf(highlight)
  const before = hi >= 0 ? title.slice(0, hi) : title
  const after = hi >= 0 ? title.slice(hi + highlight.length) : ""

  return (
    <section className="bg-brand-aurora relative overflow-hidden text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 sm:px-6 sm:py-28 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Texto */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            {t("hero.badge")}
          </span>
          <h1 className="mx-auto mt-7 max-w-xl font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:mx-0">
            {before}
            {hi >= 0 ? (
              <em className="font-semibold text-brand-gold italic">
                {highlight}
              </em>
            ) : null}
            {after}
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg lg:mx-0">
            {t("hero.subtitle")}
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link to={ctaTo}>
                {t("hero.ctaPrimary")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <a href="#templates">{t("hero.ctaSecondary")}</a>
            </Button>
          </div>
          <p className="mt-5 text-sm text-white/55">{t("hero.trust")}</p>
        </div>

        {/* Vitrine — vários celulares flutuando */}
        <HeroPhones />
      </div>
    </section>
  )
}

function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    { icon: Sparkles, ...t("how.step1", { returnObjects: true }) },
    { icon: Palette, ...t("how.step2", { returnObjects: true }) },
    { icon: Share2, ...t("how.step3", { returnObjects: true }) },
  ] as Array<{
    icon: typeof Sparkles
    title: string
    desc: string
  }>

  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading title={t("how.title")} subtitle={t("how.subtitle")} />
      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="relative rounded-2xl border border-border bg-card p-7"
          >
            <span className="absolute right-6 top-6 font-display text-4xl font-black text-secondary">
              {i + 1}
            </span>
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <step.icon className="size-5" />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

const FEATURED_CATEGORIES = [
  "wedding",
  "birthday_kids",
  "birthday_adult",
  "baby_shower",
  "halloween",
  "christmas",
]

function FeaturedTemplates({ ctaTo }: { ctaTo: string }) {
  const { t } = useTranslation()
  const featured = FEATURED_CATEGORIES.flatMap((id) => {
    const tpl = TEMPLATES.find((x) => x.category === id)
    return tpl ? [tpl] : []
  })

  return (
    <section id="templates" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          title={t("templates.title")}
          subtitle={t("templates.subtitle")}
        />
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 md:grid-cols-3">
          {featured.map((tpl) => {
            const cat = CATEGORIES.find((c) => c.id === tpl.category)
            return (
              <div key={tpl.id} className="group flex flex-col items-center">
                <div className="w-full max-w-[190px] transition-transform duration-300 group-hover:-translate-y-2">
                  {/* Moldura de celular */}
                  <div className="relative overflow-hidden rounded-[1.9rem] border-[6px] border-neutral-900 bg-neutral-900 shadow-xl">
                    <div className="absolute inset-x-0 top-0 z-10 flex justify-center">
                      <div className="h-3 w-1/4 rounded-b-lg bg-neutral-900" />
                    </div>
                    <TemplatePreview
                      template={tpl}
                      baseW={300}
                      baseH={640}
                      className="w-full"
                    />
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold shadow-sm">
                  <span aria-hidden>{cat?.emoji}</span>
                  {cat ? t(cat.labelKey) : tpl.name}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to={ctaTo}>
              {t("templates.viewAll")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function Pricing({ ctaTo }: { ctaTo: string }) {
  const { t } = useTranslation()
  const basicPrice = import.meta.env.VITE_KIWIFY_PRICE || "R$ 12,90"
  const premiumPrice = import.meta.env.VITE_KIWIFY_PRICE_PREMIUM || "R$ 19,90"

  return (
    <section id="precos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        title={t("pricing.title")}
        subtitle={t("pricing.subtitle")}
      />
      <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
        <PriceCard
          title="Básico"
          price={basicPrice}
          ctaTo={ctaTo}
          features={[
            "Convite animado completo",
            "Sua foto de fundo",
            "Contagem, RSVP, QR e agenda",
            "Mapa e compartilhamento",
          ]}
        />
        <PriceCard
          premium
          badge="Mais completo"
          title="Premium"
          price={premiumPrice}
          ctaTo={ctaTo}
          features={[
            "Tudo do Básico, e mais:",
            "Galeria de fotos",
            "Lista de presentes + PIX",
            "Música de fundo",
            "Filtros e fontes exclusivas",
          ]}
        />
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Pagamento único por convite · sem mensalidade
      </p>
    </section>
  )
}

function PriceCard({
  title,
  price,
  features,
  ctaTo,
  premium = false,
  badge,
}: {
  title: string
  price: string
  features: string[]
  ctaTo: string
  premium?: boolean
  badge?: string
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card p-8",
        premium
          ? "border-primary shadow-lg ring-1 ring-primary/20"
          : "border-border",
      )}
    >
      {badge ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {badge}
        </span>
      ) : null}
      <div className="flex items-center gap-2">
        {premium ? <Crown className="size-5 text-amber-500" /> : null}
        <span className="font-display text-xl font-bold">{title}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-4xl font-black">{price}</span>
        <span className="text-sm text-muted-foreground">/ convite</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        size="lg"
        variant={premium ? "default" : "outline"}
        className="mt-8 w-full"
      >
        <Link to={ctaTo}>Criar convite</Link>
      </Button>
    </div>
  )
}

function Testimonials() {
  const items = [
    {
      name: "Ana & Rafael",
      event: "Casamento",
      quote:
        "Nossos convidados amaram! A música tocando ao abrir emocionou todo mundo — e ficou pronto rapidinho.",
      avatar: "/perfil1.jpg",
    },
    {
      name: "Juliana",
      event: "Chá de bebê",
      quote:
        "Fiz em 10 minutos e ficou lindo. A lista de presentes com PIX salvou minha vida.",
      avatar: "/perfil2.jpg",
    },
    {
      name: "Marcos",
      event: "Aniversário de 40",
      quote:
        "Parece caro de tão profissional, mas foi baratinho. As confirmações chegaram organizadas sozinhas.",
      avatar: "/perfil3.jpg",
    },
  ]

  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          title="Quem usa, ama 💜"
          subtitle="Convites que fazem a festa começar antes da hora."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.name}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                “{it.quote}”
              </p>
              <div className="mt-5 flex items-center gap-3">
                <img
                  src={it.avatar}
                  alt={it.name}
                  loading="lazy"
                  className="size-11 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <p className="text-sm font-semibold">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{it.event}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const { t } = useTranslation()
  const items = t("faq.items", { returnObjects: true }) as Array<{
    q: string
    a: string
  }>
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title={t("faq.title")} subtitle={t("faq.subtitle")} />
        <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium"
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen ? (
                  <p className="px-5 pb-5 text-sm text-muted-foreground">
                    {item.a}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FinalCta({ ctaTo }: { ctaTo: string }) {
  const { t } = useTranslation()
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="bg-brand-aurora mx-auto max-w-5xl rounded-3xl px-6 py-16 text-center text-white">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-black sm:text-4xl">
          {t("finalCta.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-white/75">
          {t("finalCta.subtitle")}
        </p>
        <Button asChild size="xl" className="mt-8">
          <Link to={ctaTo}>
            {t("finalCta.button")}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <div className="text-center sm:text-left">
          <p className="font-display text-lg font-extrabold text-foreground">
            {t("brand")}
          </p>
          <p className="mt-1">{t("footer.tagline")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a href="#precos" className="hover:text-foreground">
            {t("footer.links.pricing")}
          </a>
          <Link to="/privacidade" className="hover:text-foreground">
            {t("footer.links.privacy")}
          </Link>
          <Link to="/termos" className="hover:text-foreground">
            {t("footer.links.terms")}
          </Link>
          <LanguageToggle />
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("brand")}. {t("footer.rights")}
      </div>
    </footer>
  )
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{subtitle}</p>
    </div>
  )
}
