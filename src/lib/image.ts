// Utilidades de imagem para o modo convidado: comprime a foto para um data URL
// (guardado no rascunho local) e converte de volta para File na hora de subir.

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB (antes de comprimir)

/**
 * Redimensiona (até `maxDim` no maior lado) e recomprime a imagem em JPEG,
 * retornando um data URL leve — bom para caber no localStorage.
 */
export async function compressImageToDataUrl(
  file: File,
  maxDim = 1600,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie um arquivo de imagem.")
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Imagem muito grande (máx. 5 MB).")
  }

  const source = await readAsDataUrl(file)
  const img = await loadImage(source)

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return source // fallback: usa a original
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL("image/jpeg", quality)
}

/**
 * Lê um arquivo qualquer (ex: mp3) como data URL, sem recomprimir. Usado no
 * rascunho de convidado, que guarda a mídia embutida até a publicação.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return readAsDataUrl(file)
}

/** Converte um data URL em File (para reenviar ao Storage). */
export async function dataUrlToFile(
  dataUrl: string,
  filename: string,
): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type || "image/jpeg" })
}

/** true se a string é uma imagem embutida (data:image/...). */
export function isDataUrl(value: string | undefined): value is string {
  return Boolean(value && value.startsWith("data:"))
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Imagem inválida."))
    image.src = src
  })
}
