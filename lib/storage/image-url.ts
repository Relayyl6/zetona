/**
 * Image optimization helper for Cloudinary, Unsplash, and local assets.
 * Injects on-the-fly resizing and compression parameters to drastically reduce bandwidth
 * and eliminate slow loading delays.
 */

export function getOptimizedImageUrl(
  src: string | undefined | null,
  width = 800,
  quality = 80
): string {
  if (!src) return "";

  // Cloudinary CDN: inject w_${width},q_auto,f_auto,c_limit
  if (src.includes("res.cloudinary.com")) {
    if (/\/upload\/w_\d+[^/]*\//.test(src)) {
      return src.replace(/\/upload\/w_\d+[^/]*\//, `/upload/w_${width},q_auto,f_auto,c_limit/`);
    }
    return src.replace("/upload/", `/upload/w_${width},q_auto,f_auto,c_limit/`);
  }

  // Unsplash CDN
  if (src.includes("images.unsplash.com")) {
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}w=${width}&q=${quality}&auto=format`;
  }

  return src;
}

export const getOptimizedSrc = getOptimizedImageUrl;
