import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";
import { buildOwnerReplyWhatsAppUrl } from "@/lib/whatsapp";

export interface EmailEnquiryPayload {
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
 * Builds the HTML content for owner notification emails.
 * Uses bulletproof table layout and explicit text styling to prevent
 * webmail link-color overrides and dark mode contrast loss.
 */
export function generateOwnerEnquiryHtml(payload: EmailEnquiryPayload): string {
  const clientWhatsAppUrl = payload.phone
    ? buildOwnerReplyWhatsAppUrl({
        name: payload.name,
        phone: payload.phone,
        sessionType: payload.sessionType,
        message: payload.message,
      })
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0A0A; color: #F6F2E6; margin: 0; padding: 40px 20px; }
          .card { max-width: 580px; margin: 0 auto; background-color: #141414; border: 1px solid #282828; border-radius: 12px; padding: 32px; }
          .tag { display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #7B97FF; font-family: monospace; margin-bottom: 16px; }
          h1 { font-size: 24px; font-weight: 600; margin: 0 0 20px 0; color: #F6F2E6; }
          .field { margin-bottom: 16px; border-bottom: 1px solid #222; padding-bottom: 12px; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 4px; font-family: monospace; }
          .value { font-size: 15px; color: #F6F2E6; }
          .message-box { background-color: #0A0A0A; border: 1px solid #282828; border-radius: 8px; padding: 16px; margin-top: 16px; font-size: 14px; line-height: 1.6; color: #DDD; white-space: pre-wrap; }
          a, a:visited, a:hover { color: inherit; }
        </style>
      </head>
      <body style="background-color: #0A0A0A; color: #F6F2E6; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div class="card" style="max-width: 580px; margin: 0 auto; background-color: #141414; border: 1px solid #282828; border-radius: 12px; padding: 32px;">
          <div class="tag" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #7B97FF; font-family: monospace; margin-bottom: 16px;">• New Client Enquiry</div>
          <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 20px 0; color: #F6F2E6;">${payload.name} has reached out.</h1>
          
          <div class="field" style="margin-bottom: 16px; border-bottom: 1px solid #222; padding-bottom: 12px;">
            <div class="label" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 4px; font-family: monospace;">Client Name</div>
            <div class="value" style="font-size: 15px; color: #F6F2E6;">${payload.name}</div>
          </div>

          <div class="field" style="margin-bottom: 16px; border-bottom: 1px solid #222; padding-bottom: 12px;">
            <div class="label" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 4px; font-family: monospace;">Email Address</div>
            <div class="value" style="font-size: 15px; color: #F6F2E6;"><a href="mailto:${payload.email}" style="color: #7B97FF; text-decoration: underline;">${payload.email}</a></div>
          </div>

          ${payload.phone ? `
          <div class="field" style="margin-bottom: 16px; border-bottom: 1px solid #222; padding-bottom: 12px;">
            <div class="label" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 4px; font-family: monospace;">Phone Number</div>
            <div class="value" style="font-size: 15px; color: #F6F2E6;">${payload.phone}</div>
          </div>
          ` : ""}

          ${payload.sessionType ? `
          <div class="field" style="margin-bottom: 16px; border-bottom: 1px solid #222; padding-bottom: 12px;">
            <div class="label" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 4px; font-family: monospace;">Session Focus</div>
            <div class="value" style="font-size: 15px; color: #F6F2E6; text-transform: capitalize;">${payload.sessionType}</div>
          </div>
          ` : ""}

          <div class="field" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
            <div class="label" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 4px; font-family: monospace;">Client Message</div>
            <div class="message-box" style="background-color: #0A0A0A; border: 1px solid #282828; border-radius: 8px; padding: 16px; margin-top: 12px; font-size: 14px; line-height: 1.6; color: #DDD; white-space: pre-wrap;">${payload.message}</div>
          </div>

          <!-- Bulletproof Action Buttons for Gmail, Apple Mail, Outlook -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #282828;">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate;">
              <tr>
                <td align="center" style="border-radius: 9999px; background-color: #2B59FF;">
                  <a href="mailto:${payload.email}" target="_blank" style="background-color: #2B59FF; border: 1px solid #2B59FF; border-radius: 9999px; color: #FFFFFF !important; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; line-height: 100%; padding: 13px 26px; text-decoration: none; -webkit-text-size-adjust: none;">
                    <span style="color: #FFFFFF !important; text-decoration: none; font-weight: 600;">Reply via Email &rarr;</span>
                  </a>
                </td>
                ${clientWhatsAppUrl ? `
                <td style="width: 14px;"></td>
                <td align="center" style="border-radius: 9999px; background-color: #25D366;">
                  <a href="${clientWhatsAppUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #25D366; border: 1px solid #25D366; border-radius: 9999px; color: #FFFFFF !important; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; line-height: 100%; padding: 13px 26px; text-decoration: none; -webkit-text-size-adjust: none;">
                    <span style="color: #FFFFFF !important; text-decoration: none; font-weight: 600;">Open WhatsApp &#8599;</span>
                  </a>
                </td>
                ` : ""}
              </tr>
            </table>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Sends a notification email to the studio owner (Zetona_E) and records dispatch.
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
  const ownerHtml = generateOwnerEnquiryHtml(payload);

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
