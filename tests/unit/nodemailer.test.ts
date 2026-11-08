import { describe, it, expect } from "vitest";
import { sendEnquiryNotificationEmail, generateOwnerEnquiryHtml } from "@/lib/email/nodemailer";

describe("Nodemailer service", () => {
  it("gracefully handles unconfigured SMTP credentials without crashing", async () => {
    const originalHost = process.env.SMTP_HOST;
    delete process.env.SMTP_HOST;

    const result = await sendEnquiryNotificationEmail({
      name: "Amara Okonkwo",
      email: "amara@example.com",
      phone: "08012345678",
      sessionType: "portrait",
      message: "Testing studio booking.",
    });

    expect(result.sent).toBe(false);
    expect(result.reason).toBe("SMTP not configured");

    if (originalHost) {
      process.env.SMTP_HOST = originalHost;
    }
  });

  it("generates owner HTML with direct WhatsApp link to client phone and bulletproof button contrast", () => {
    const html = generateOwnerEnquiryHtml({
      name: "Leonard Oseghale",
      email: "oseghaleleonard39@gmail.com",
      phone: "09064982841",
      sessionType: "portrait",
      message: "something that im testing",
    });

    // Directly chats with the client's normalized WhatsApp number
    expect(html).toContain("https://wa.me/2349064982841");
    expect(html).toContain("Leonard%20Oseghale");
    expect(html).toContain(encodeURIComponent('"something that im testing"'));

    // Bulletproof inline white text for email button contrast
    expect(html).toContain("color: #FFFFFF !important;");
    expect(html).toContain("Reply via Email &rarr;");
    expect(html).toContain("Open WhatsApp &#8599;");
  });

  it("omits WhatsApp button when phone number is not provided", () => {
    const html = generateOwnerEnquiryHtml({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "General enquiry without phone",
    });

    expect(html).not.toContain("https://wa.me/");
    expect(html).not.toContain("Open WhatsApp");
  });
});
