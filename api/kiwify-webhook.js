// Vercel Serverless Function — webhook da Kiwify
// Recebe a confirmação de pagamento, valida a assinatura e publica o convite.
import crypto from "node:crypto"

async function readRawBody(req) {
  const chunks = []
  try {
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
    }
  } catch {
    // ignora — cai no fallback
  }
  if (chunks.length > 0) return Buffer.concat(chunks).toString("utf8")
  if (req.body) {
    return typeof req.body === "string" ? req.body : JSON.stringify(req.body)
  }
  return ""
}

function timingEqual(a, b) {
  try {
    const ba = Buffer.from(String(a))
    const bb = Buffer.from(String(b))
    if (ba.length !== bb.length) return false
    return crypto.timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405
    return res.end("Method Not Allowed")
  }

  const raw = await readRawBody(req)
  const secret = process.env.KIWIFY_WEBHOOK_SECRET
  const signature = (
    req.query?.signature ||
    req.headers["x-kiwify-signature"] ||
    ""
  ).toString()

  let payload = {}
  try {
    payload = JSON.parse(raw)
  } catch {
    payload = {}
  }

  // Assinatura Kiwify: HMAC do corpo cru com o token. Testamos SHA1 e SHA256.
  let valid = false
  if (secret && raw) {
    const sha1 = crypto.createHmac("sha1", secret).update(raw).digest("hex")
    const sha256 = crypto.createHmac("sha256", secret).update(raw).digest("hex")
    valid =
      Boolean(signature) &&
      (timingEqual(signature, sha1) || timingEqual(signature, sha256))
  }

  const status = String(
    payload.order_status || payload.status || "",
  ).toLowerCase()
  const tracking =
    payload.TrackingParameters || payload.tracking_parameters || {}

  // O ID do convite é um UUID enviado no `sck`. Procuramos por ele de forma
  // robusta: no sck/src, e como fallback qualquer campo de rastreio que seja UUID.
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  let inviteId =
    tracking.sck || tracking.s1 || tracking.src || payload.sck || null
  if (!inviteId || !UUID_RE.test(String(inviteId))) {
    inviteId = null
    for (const v of Object.values(tracking)) {
      if (typeof v === "string" && UUID_RE.test(v)) {
        inviteId = v
        break
      }
    }
  }

  // Log para inspeção nos logs da Vercel (finalizamos os campos após a venda de teste)
  console.log(
    "[kiwify-webhook]",
    JSON.stringify({
      valid,
      hasSecret: Boolean(secret),
      signaturePresent: Boolean(signature),
      status,
      inviteId,
      trackingKeys: Object.keys(tracking || {}),
      topLevelKeys: Object.keys(payload || {}),
    }),
  )

  if (!secret) {
    res.statusCode = 500
    return res.end("webhook secret not configured")
  }
  if (!valid) {
    res.statusCode = 401
    return res.end("invalid signature")
  }

  const approved = ["paid", "approved", "aprovado", "completed", "pago"].includes(
    status,
  )

  if (approved && inviteId) {
    try {
      const SUPA = process.env.VITE_SUPABASE_URL
      const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
      const r = await fetch(`${SUPA}/rest/v1/invites?id=eq.${inviteId}`, {
        method: "PATCH",
        headers: {
          apikey: SERVICE,
          Authorization: `Bearer ${SERVICE}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: "published",
          payment_id: payload.order_id || payload.order_ref || null,
        }),
      })
      console.log("[kiwify-webhook] publish result", inviteId, r.status)
    } catch (err) {
      console.error("[kiwify-webhook] publish error", err)
    }
  }

  res.statusCode = 200
  res.end("ok")
}
