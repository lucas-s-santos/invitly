import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowRight,
  Check,
  ChevronDown,
  Palette,
  Share2,
  Sparkles,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { getTemplate, TEMPLATES } from "@/lib/templates"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/LanguageToggle"
import { TemplatePreview } from "@/components/invite/TemplatePreview"

export default function Landing() {
  const { user } = useAuth()
  const ctaTo = user ? "/dashboard" : "/login"

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar ctaTo={ctaTo} />
      <main className="flex-1">
        <Hero ctaTo={ctaTo} />
        <HowItWorks />
        <FeaturedTemplates ctaTo={ctaTo} />
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
  const links = [
    { href: "#como-funciona", label: t("nav.howItWorks") },
    { href: "#templates", label: t("nav.templates") },
    { href: "#precos", label: t("nav.pricing") },
    { href: "#faq", label: t("nav.faq") },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-display text-xl font-extrabold">
          {t("brand")}
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle className="hidden sm:inline-flex" />
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">{t("nav.login")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to={ctaTo}>{t("nav.createCta")}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function Hero({ ctaTo }: { ctaTo: string }) {
  const { t } = useTranslation()
  const stats = [
    { value: "12k+", label: t("stats.created") },
    { value: "9", label: t("stats.events") },
    { value: "48k+", label: t("stats.rsvps") },
  ]

  const heroTemplate = getTemplate("wedding-classico")

  return (
    <section className="bg-brand-aurora relative overflow-hidden text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2">
        {/* Texto */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            {t("hero.badge")}
          </span>
          <h1 className="mx-auto mt-6 max-w-xl font-display text-4xl leading-tight font-black sm:text-6xl lg:mx-0">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/75 sm:text-lg lg:mx-0">
            {t("hero.subtitle")}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
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

          <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-8 lg:mx-0">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl font-bold text-brand-gold">
                  {s.value}
                </dt>
                <dd className="mt-1 text-xs text-white/60">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Mockup de celular */}
        {heroTemplate ? (
          <div className="flex justify-center">
            <div className="relative w-[250px] [animation:invitly-float_5s_ease-in-out_infinite] sm:w-[280px]">
              <div className="overflow-hidden rounded-[2.5rem] border-[10px] border-black/90 bg-black shadow-2xl">
                <TemplatePreview template={heroTemplate} className="w-full" />
              </div>
            </div>
          </div>
        ) : null}
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

function FeaturedTemplates({ ctaTo }: { ctaTo: string }) {
  const { t } = useTranslation()
  const featured = TEMPLATES.slice(0, 6)

  return (
    <section id="templates" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          title={t("templates.title")}
          subtitle={t("templates.subtitle")}
        />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
          {featured.map((tpl) => (
            <div
              key={tpl.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <TemplatePreview
                  template={tpl}
                  className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-4">
                <span className="truncate text-sm font-semibold">
                  {tpl.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    tpl.isPremium
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {tpl.isPremium ? t("templates.premium") : t("templates.free")}
                </span>
              </div>
            </div>
          ))}
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
  const plans = [
    { key: "basic", featured: false },
    { key: "premium", featured: true },
    { key: "pack", featured: false },
  ] as const

  return (
    <section id="precos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        title={t("pricing.title")}
        subtitle={t("pricing.subtitle")}
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const name = t(`pricing.plans.${plan.key}.name`)
          const price = t(`pricing.plans.${plan.key}.price`)
          const features = t(`pricing.plans.${plan.key}.features`, {
            returnObjects: true,
          }) as string[]

          return (
            <div
              key={plan.key}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7",
                plan.featured
                  ? "border-primary bg-card shadow-lg ring-1 ring-primary/30"
                  : "border-border bg-card",
              )}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {t("pricing.mostPopular")}
                </span>
              ) : null}
              <h3 className="font-display text-lg font-bold">{name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-black">{price}</span>
                <span className="text-sm text-muted-foreground">
                  {t("pricing.perInvite")}
                </span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
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
                variant={plan.featured ? "default" : "outline"}
                className="mt-7 w-full"
              >
                <Link to={ctaTo}>{t("pricing.cta")}</Link>
              </Button>
            </div>
          )
        })}
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
        <div className="flex items-center gap-6">
          <a href="#precos" className="hover:text-foreground">
            {t("footer.links.pricing")}
          </a>
          <a href="#faq" className="hover:text-foreground">
            {t("footer.links.faq")}
          </a>
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
