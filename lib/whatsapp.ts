import { siteConfig } from "@/lib/site-config";

/**
 * Normalizes phone numbers to international WhatsApp format.
 * Handles Nigerian local format (e.g. 09064982841 -> 2349064982841)
 * and international formats with leading + or 00.
 */
export function formatWhatsAppPhone(phone: string): string {
  let cleaned = phone.trim().replace(/[^0-9]/g, "");

  // Nigerian local 11-digit numbers starting with 0 (e.g. 080..., 090..., 070..., 081...)
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return "234" + cleaned.slice(1);
  }

  // Nigerian 10-digit without leading 0 (e.g. 9064982841)
  if (cleaned.length === 10 && (cleaned.startsWith("8") || cleaned.startsWith("9") || cleaned.startsWith("7"))) {
    return "234" + cleaned;
  }

  // Already prefixed with 234 (e.g. 2349064982841)
  if (cleaned.startsWith("234") && cleaned.length >= 13) {
    return cleaned;
  }

  return cleaned || siteConfig.whatsappE164Digits;
}

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
  const targetPhone = options?.phoneDigits
    ? formatWhatsAppPhone(options.phoneDigits)
    : siteConfig.whatsappE164Digits;

  const rawMessage =
    customMessage !== undefined
      ? customMessage
      : `Hello ${siteConfig.brandName}, I found your portfolio and I'd like to book a shoot.`;

  const maxChars = options?.maxChars || 500;
  const message =
    rawMessage.length > maxChars
      ? rawMessage.slice(0, maxChars) + "..."
      : rawMessage;

  const encodedMessage = message ? encodeURIComponent(message) : "";
  return encodedMessage
    ? `https://wa.me/${targetPhone}?text=${encodedMessage}`
    : `https://wa.me/${targetPhone}`;
}

/**
 * Builds a bespoke WhatsApp reply message from Zetona to an enquiry client.
 * Conversational, authentic tone from Zetona's perspective:
 * 1. Personally greets the client from Zetona.
 * 2. Replies directly to the client's actual message.
 * 3. Inquires about shoot timing, location preferences, and creative concepts.
 */
export function buildOwnerClientReplyMessage({
  name,
  sessionType,
  message,
}: {
  name: string;
  sessionType?: string | null;
  message?: string | null;
}): string {
  const cleanName = name.trim();
  const sessionLabel =
    sessionType && sessionType.toLowerCase() !== "other"
      ? `${sessionType.toLowerCase()} session`
      : "photoshoot";

  const trimmedMessage = message?.trim();
  const quotedMessage =
    trimmedMessage && trimmedMessage.length > 250
      ? trimmedMessage.slice(0, 247) + "..."
      : trimmedMessage;

  if (quotedMessage) {
    return (
      `Hi ${cleanName}, this is Zetona. Thanks for getting in touch!\n\n` +
      `Regarding your message:\n"${quotedMessage}"\n\n` +
      `I'd love to work with you on your ${sessionLabel}. When are you looking to do the shoot, and do you have any specific dates or ideas in mind?`
    );
  }

  return (
    `Hi ${cleanName}, this is Zetona. Thanks for getting in touch!\n\n` +
    `I'd love to work with you on your ${sessionLabel}. When are you looking to do the shoot, and do you have any specific dates or ideas in mind?`
  );
}

/**
 * Builds a direct WhatsApp chat URL for Zetona to reply to an enquiry client.
 */
export function buildOwnerReplyWhatsAppUrl({
  name,
  phone,
  sessionType,
  message,
}: {
  name: string;
  phone: string;
  sessionType?: string | null;
  message?: string | null;
}): string {
  const replyMessage = buildOwnerClientReplyMessage({ name, sessionType, message });
  return buildWhatsAppUrl(replyMessage, { phoneDigits: phone });
}
