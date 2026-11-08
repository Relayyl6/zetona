import { siteConfig } from "@/lib/site-config";

/**
 * Builds a direct WhatsApp chat link (wa.me)
 * Source: docs/CONTENT.md §3.5 & docs/TESTING.md §2
 */
export function buildWhatsAppUrl(
  customMessage?: string,
  options?: {
    phoneDigits?: string;
    maxChars?: number;
  }
): string {
  const phone = options?.phoneDigits || siteConfig.whatsappE164Digits;
  const sanitizedPhone = phone.replace(/[^0-9]/g, "");

  const rawMessage =
    customMessage ||
    `Hello ${siteConfig.brandName}, I found your portfolio and I'd like to book a shoot.`;

  const maxChars = options?.maxChars || 500;
  const message =
    rawMessage.length > maxChars
      ? rawMessage.slice(0, maxChars) + "..."
      : rawMessage;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${sanitizedPhone}?text=${encodedMessage}`;
}
