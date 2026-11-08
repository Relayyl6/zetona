import { describe, it, expect } from "vitest";
import {
  buildWhatsAppUrl,
  buildOwnerClientReplyMessage,
  buildOwnerReplyWhatsAppUrl,
} from "@/lib/whatsapp";

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

describe("buildOwnerClientReplyMessage", () => {
  it("replies directly from Zetona's perspective, quotes the client's message, and inquires about shoot details", () => {
    const reply = buildOwnerClientReplyMessage({
      name: "Leonard Oseghale",
      sessionType: "portrait",
      message: "something that im testing",
    });

    // Introduces Zetona authentically
    expect(reply).toContain("Hi Leonard Oseghale, this is Zetona.");
    // Replies directly to what the client wrote
    expect(reply).toContain('Regarding your message:\n"something that im testing"');
    // Inquires about timing and concepts
    expect(reply).toContain("I'd love to work with you on your portrait session.");
    expect(reply).toContain("When are you looking to do the shoot, and do you have any specific dates or ideas in mind?");
  });

  it("handles empty or missing message gracefully while still inquiring", () => {
    const reply = buildOwnerClientReplyMessage({
      name: "Amara",
      sessionType: "studio",
      message: "",
    });

    expect(reply).toContain("Hi Amara, this is Zetona.");
    expect(reply).toContain("I'd love to work with you on your studio session.");
    expect(reply).toContain("When are you looking to do the shoot");
  });

  it("buildOwnerReplyWhatsAppUrl returns fully formed wa.me url with normalized client number", () => {
    const url = buildOwnerReplyWhatsAppUrl({
      name: "Leonard Oseghale",
      phone: "09064982841",
      sessionType: "portrait",
      message: "something that im testing",
    });

    expect(url).toContain("https://wa.me/2349064982841?text=");
    expect(url).toContain(encodeURIComponent("Hi Leonard Oseghale, this is Zetona."));
    expect(url).toContain(encodeURIComponent('"something that im testing"'));
  });
});
