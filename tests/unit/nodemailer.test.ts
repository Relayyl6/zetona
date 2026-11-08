import { describe, it, expect } from "vitest";
import { sendEnquiryNotificationEmail } from "@/lib/email/nodemailer";

describe("Nodemailer service", () => {
  it("gracefully handles unconfigured SMTP credentials without crashing", async () => {
    // When SMTP credentials are not configured in environment, it should report false safely
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
});
