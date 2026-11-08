/**
 * Image loader abstraction supporting Cloudflare Image Transformations,
 * pre-generated variants, and local fallback.
 * Source: docs/MEDIA-PIPELINE.md §3
 */

export interface LoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudflareLoader({ src, width, quality }: LoaderProps): string {
  // 1. If absolute external URL (e.g. Cloudinary, Unsplash or placeholder)
  if (src.startsWith("http://") || src.startsWith("https://")) {
    if (src.includes("res.cloudinary.com")) {
      const q = quality ?? 82;
      return src.replace("/upload/", `/upload/w_${width},q_${q},f_auto,c_limit/`);
    }
    if (src.includes("images.unsplash.com")) {
      const sep = src.includes("?") ? "&" : "?";
      return `${src}${sep}w=${width}&q=${quality ?? 82}&auto=format`;
    }
    return src;
  }

  // 2. In local dev or if src is a local dev placeholder
  if (src.startsWith("/") || process.env.NODE_ENV === "development") {
    return src;
  }

  const strategy = process.env.IMAGE_STRATEGY || "transform";
  const baseUrl = process.env.R2_PUBLIC_BASE_URL || "";
  const cleanSrc = src.startsWith("/") ? src.slice(1) : src;
  const fullMediaUrl = `${baseUrl}/${cleanSrc}`;
  const q = quality ?? 82;

  if (strategy === "transform") {
    return `/cdn-cgi/image/width=${width},quality=${q},format=auto,fit=scale-down/${fullMediaUrl}`;
  }

  // Strategy B: Variants
  const variants = [480, 960, 1600, 2400];
  const targetWidth = variants.find((v) => v >= width) || 2400;
  return fullMediaUrl.replace("-display.jpg", `-w${targetWidth}.jpg`);
}
