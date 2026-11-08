import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface EmailEnquiryPayload {
  name: string;
  email: string;
  phone?: string | null;
  sessionType?: string | null;
  message: string;
}

/**
 * Creates a configured Nodemailer SMTP transporter.
 * Reads standard SMTP environment variables.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/^["']|["']$/g, "");

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends a notification email to the studio owner (Zetona_E) and an acknowledgment to the client.
 */
export async function sendEnquiryNotificationEmail(payload: EmailEnquiryPayload) {
  const transporter = getTransporter();
  
  if (!transporter) {
    console.info(
      "[Nodemailer] SMTP credentials not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Skipping email dispatch."
    );
    return { sent: false, reason: "SMTP not configured" };
  }

  const fromAddress =
    process.env.SMTP_FROM ||
    `"${siteConfig.brandName} Portfolio" <${process.env.SMTP_USER || siteConfig.email}>`;
  const ownerEmail = process.env.CONTACT_TO_EMAIL || siteConfig.email;
  const whatsappUrl = payload.phone ? buildWhatsAppUrl(undefined, { phoneDigits: payload.phone }) : "";

  // 1. Notification to Studio Owner
  const ownerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0A0A; color: #F6F2E6; margin: 0; padding: 40px 20px; }
          .card { max-width: 580px; margin: 0 auto; background-color: #141414; border: 1px solid #282828; border-radius: 12px; padding: 32px; }
          .tag { display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #2B59FF; font-family: monospace; margin-bottom: 16px; }
          h1 { font-size: 24px; font-weight: 600; margin: 0 0 20px 0; color: #F6F2E6; }
          .field { margin-bottom: 16px; border-bottom: 1px solid #222; padding-bottom: 12px; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 4px; font-family: monospace; }
          .value { font-size: 15px; color: #F6F2E6; }
          .message-box { background-color: #0A0A0A; border: 1px solid #282828; border-radius: 8px; padding: 16px; margin-top: 16px; font-size: 14px; line-height: 1.6; color: #DDD; white-space: pre-wrap; }
          .actions { margin-top: 28px; display: flex; gap: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #2B59FF; color: #FFF; text-decoration: none; border-radius: 9999px; font-size: 13px; font-weight: 500; }
          .btn-outline { display: inline-block; padding: 10px 20px; background-color: transparent; border: 1px solid #444; color: #F6F2E6; text-decoration: none; border-radius: 9999px; font-size: 13px; margin-left: 8px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="tag">• New Client Enquiry</div>
          <h1>${payload.name} has reached out.</h1>
          
          <div class="field">
            <div class="label">Client Name</div>
            <div class="value">${payload.name}</div>
          </div>

          <div class="field">
            <div class="label">Email Address</div>
            <div class="value"><a href="mailto:${payload.email}" style="color: #2B59FF;">${payload.email}</a></div>
          </div>

          ${payload.phone ? `
          <div class="field">
            <div class="label">Phone Number</div>
            <div class="value">${payload.phone}</div>
          </div>
          ` : ""}

          ${payload.sessionType ? `
          <div class="field">
            <div class="label">Session Focus</div>
            <div class="value" style="text-transform: capitalize;">${payload.sessionType}</div>
          </div>
          ` : ""}

          <div class="field" style="border-bottom: none;">
            <div class="label">Client Message</div>
            <div class="message-box">${payload.message}</div>
          </div>

          <div class="actions">
            <a href="mailto:${payload.email}" class="btn">Reply via Email →</a>
            ${whatsappUrl ? `<a href="${whatsappUrl}" class="btn-outline">Open WhatsApp ↗</a>` : ""}
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: ownerEmail,
      subject: `New Enquiry from ${payload.name} [${payload.sessionType || "Portfolio"}]`,
      text: `New Enquiry from ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || "N/A"}\nType: ${payload.sessionType || "General"}\n\nMessage:\n${payload.message}`,
      html: ownerHtml,
      replyTo: payload.email,
    });

    console.info("[Nodemailer] Owner notification email dispatched:", info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[Nodemailer] Failed to send email:", err);
    return { sent: false, error: err.message };
  }
}
