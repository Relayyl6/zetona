import { describe, it, expect } from "vitest";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

describe("buildWhatsAppUrl", () => {
  it("formats the default URL correctly with E.164 phone digits and no '+' or spaces", () => {
    const url = buildWhatsAppUrl();
    expect(url).toContain("https://wa.me/2348030812138?text=");
    expect(url).not.toContain("+");
    expect(url).not.toContain(" ");
  });

  it("properly encodes unicode and special characters", () => {
    const url = buildWhatsAppUrl("Hello & Welcome! Let's talk.");
    expect(url).toContain("Hello%20%26%20Welcome!%20Let's%20talk.");
  });

  it("truncates message when exceeding maxChars", () => {
    const longMessage = "a".repeat(600);
    const url = buildWhatsAppUrl(longMessage, { maxChars: 100 });
    const query = new URL(url).searchParams.get("text");
    expect(query?.length).toBeLessThanOrEqual(103); // 100 + '...'
  });

  it("normalizes local Nigerian 11-digit phone numbers with 234 country code", () => {
    const url = buildWhatsAppUrl("Hello", { phoneDigits: "09064982841" });
    expect(url).toContain("https://wa.me/2349064982841?text=Hello");
  });
});
