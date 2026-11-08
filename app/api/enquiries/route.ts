import { NextRequest, NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validators/enquiry";
import { createEnquiry } from "@/lib/db/data-store";
import { sendEnquiryNotificationEmail } from "@/lib/email/nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod validation
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, phone, sessionType, message, website } = parsed.data;

    // 2. Honeypot check (must be empty)
    if (website && website.length > 0) {
      return NextResponse.json({ ok: true, message: "Received" }, { status: 200 });
    }

    // 3. Save to Neon PostgreSQL DB & local backup first (guarantees lead is never lost)
    const enquiry = await createEnquiry({
      name,
      email,
      phone: phone || null,
      sessionType: sessionType || null,
      message,
    });

    // 4. Dispatch notification via Nodemailer (SMTP)
    try {
      await sendEnquiryNotificationEmail({
        name,
        email,
        phone,
        sessionType,
        message,
      });
    } catch (mailErr) {
      console.warn("[Nodemailer] Email dispatch error (enquiry is safely stored):", mailErr);
    }

    return NextResponse.json(
      { ok: true, message: "Thank you. Your message is in. I'll reply soon." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Enquiry API error:", err);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try WhatsApp or email directly." },
      { status: 500 }
    );
  }
}
