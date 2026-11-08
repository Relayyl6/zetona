/**
 * R2 Storage key utilities
 * Source: docs/MEDIA-PIPELINE.md §2
 */

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function buildDisplayKey(photoId: string, contentHash8: string): string {
  return `photos/${photoId}/${contentHash8}-display.jpg`;
}

export function buildOriginalKey(photoId: string, originalFilename: string): string {
  const safeName = sanitizeFilename(originalFilename);
  return `photos/${photoId}/${safeName}`;
}

export function buildVariantKey(photoId: string, contentHash8: string, width: 480 | 960 | 1600 | 2400): string {
  return `photos/${photoId}/${contentHash8}-w${width}.jpg`;
}
