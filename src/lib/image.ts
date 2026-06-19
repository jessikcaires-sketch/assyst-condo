/**
 * Redimensiona/compacta uma imagem no cliente antes de persistir em
 * localStorage — evita estourar o limite (~5 MB) ao salvar fachadas.
 * Retorna um data URL JPEG (ou o original em data URL se algo falhar).
 */
export async function compressImage(
  file: File,
  maxDim = 1280,
  quality = 0.8,
): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  // SVG / formatos sem raster previsível: mantém como veio.
  if (file.type === "image/svg+xml") return dataUrl;

  try {
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return dataUrl;
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
