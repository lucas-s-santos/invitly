// Gera o "copia e cola" (BR Code / EMV) de um PIX estatico,
// pronto para virar QR Code e ser lido por qualquer banco.

/** Campo EMV: id + tamanho (2 digitos) + valor. */
function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0")
  return `${id}${len}${value}`
}

/** CRC16-CCITT (polinomio 0x1021, inicial 0xFFFF) exigido pelo BR Code. */
function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

/** Remove acentos/simbolos e limita o tamanho (regras do BR Code). */
function sanitize(value: string, max: number): string {
  // NFD separa a letra da marca de acento; o filtro seguinte descarta a marca.
  return value
    .normalize("NFD")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .slice(0, max)
}

export interface PixOptions {
  key: string
  name: string
  city?: string
  /** valor fixo em reais (opcional; sem valor = o pagador escolhe) */
  amount?: number
}

/** Monta o payload PIX "copia e cola" (estatico). */
export function buildPixPayload({ key, name, city, amount }: PixOptions): string {
  const cleanName = sanitize(name || "RECEBEDOR", 25) || "RECEBEDOR"
  const cleanCity = sanitize(city || "BRASIL", 15) || "BRASIL"

  const merchantAccount = emv(
    "26",
    emv("00", "br.gov.bcb.pix") + emv("01", key.trim()),
  )

  const body =
    emv("00", "01") + // Payload Format Indicator
    merchantAccount +
    emv("52", "0000") + // Merchant Category Code
    emv("53", "986") + // moeda: BRL
    (amount && amount > 0 ? emv("54", amount.toFixed(2)) : "") +
    emv("58", "BR") +
    emv("59", cleanName) +
    emv("60", cleanCity) +
    emv("62", emv("05", "***")) // txid livre

  const toCrc = body + "6304"
  return toCrc + crc16(toCrc)
}
