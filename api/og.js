// Vercel Serverless Function — injeta meta tags Open Graph na página do convite
// para que o link mostre nome/foto do evento ao ser compartilhado (WhatsApp, etc.)

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export default async function handler(req, res) {
  const slug = req.query.slug
  const proto = req.headers["x-forwarded-proto"] || "https"
  const origin = `${proto}://${req.headers.host}`

  // HTML base do SPA
  let html
  try {
    const r = await fetch(`${origin}/index.html`)
    html = await r.text()
  } catch {
    res.statusCode = 302
    res.setHeader("Location", "/")
    return res.end()
  }

  // Busca o convite publicado
  let og = null
  try {
    const SUPA = process.env.VITE_SUPABASE_URL
    const ANON = process.env.VITE_SUPABASE_ANON_KEY
    const q = `${SUPA}/rest/v1/invites?slug=eq.${encodeURIComponent(
      slug,
    )}&status=eq.published&select=title,data`
    const r = await fetch(q, {
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
    })
    const rows = await r.json()
    const inv = Array.isArray(rows) ? rows[0] : null
    if (inv) {
      const data = inv.data || {}
      const title = `Você foi convidado: ${inv.title || "confira!"}`
      const parts = [data.hosts, data.event_date].filter(Boolean).join(" · ")
      const desc = data.message || parts || "Confirme sua presença no Invitly."
      og = {
        title,
        desc,
        image: data.background_image || "",
        url: `${origin}/convite/${slug}`,
      }
    }
  } catch {
    og = null
  }

  if (og) {
    // Remove tags OG/twitter padrão e injeta as do convite
    html = html
      .replace(/\s*<meta property="og:[^>]*>/g, "")
      .replace(/\s*<meta name="twitter:[^>]*>/g, "")

    const tags = [
      `<meta property="og:type" content="website" />`,
      `<meta property="og:title" content="${escapeHtml(og.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(og.desc)}" />`,
      `<meta property="og:url" content="${escapeHtml(og.url)}" />`,
      og.image
        ? `<meta property="og:image" content="${escapeHtml(og.image)}" />`
        : "",
      `<meta name="twitter:card" content="${og.image ? "summary_large_image" : "summary"}" />`,
      `<meta name="twitter:title" content="${escapeHtml(og.title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(og.desc)}" />`,
      og.image
        ? `<meta name="twitter:image" content="${escapeHtml(og.image)}" />`
        : "",
    ]
      .filter(Boolean)
      .join("\n    ")

    html = html.replace("</head>", `    ${tags}\n  </head>`)
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300")
  res.statusCode = 200
  res.end(html)
}
