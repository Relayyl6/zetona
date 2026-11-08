"use client";

import React, { useState } from "react";
import Image from "next/image";
import { enquirySchema } from "@/lib/validators/enquiry";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site-config";
import { Reveal } from "@/components/motion/Reveal";
import { getOptimizedSrc } from "@/lib/storage/image-url";

type FormData = {
  name: string;
  email: string;
  phone: string;
  sessionType: "portrait" | "studio" | "other" | "";
  message: string;
  website: string; // honeypot
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type FormState = "idle" | "submitting" | "success" | "error";

interface ContactClientProps {
  portraitSrc: string;
}

export function ContactClient({ portraitSrc }: ContactClientProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    sessionType: "",
    message: "",
    website: "", // honeypot
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [state, setState] = useState<FormState>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");

    // Client-side validation
    const result = enquirySchema.safeParse({
      ...formData,
      sessionType: formData.sessionType || undefined,
      turnstileToken: "dev-stub",
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setState("idle");
      return;
    }

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setState("success");
        window.dispatchEvent(new CustomEvent("admin-enquiries-changed"));
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  const inputClass =
    "w-full bg-white/[0.03] border-b border-white/20 text-[#F6F2E6] font-sans text-base px-3 py-3 rounded-t focus:outline-none focus:border-[var(--accent)] focus:bg-white/[0.06] placeholder:text-[var(--fg-dim)] transition-colors duration-200";
  const labelClass = "text-[var(--fg-muted)] text-xs font-sans uppercase tracking-widest mb-1.5 block";

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg)] pt-20 pb-20">
      {/* Giant CTA headline — tight top spacing, no blank gap */}
      <div className="px-6 md:px-12 pt-4 pb-6">
        <h1
          className="font-condensed uppercase text-[#F6F2E6] leading-none tracking-tight flex items-center gap-3 sm:gap-6 flex-wrap"
          style={{ fontSize: "clamp(3.5rem, 11vw, 10.5rem)" }}
        >
          <span>LET&apos;S TALK.</span>
          <span className="text-[var(--accent-text)]">→</span>
        </h1>
      </div>

      <div className="border-t border-white/10 px-6 md:px-12 pt-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Glassmorphic Contact Form */}
          <div className="lg:col-span-7">
            <Reveal className="mb-6">
              <p className="text-[var(--fg-muted)] font-sans text-base leading-relaxed max-w-lg">
                Tell me about your shoot: who, when, and what you have in mind. Based in Benin City, available across Nigeria and worldwide.
              </p>
            </Reveal>

            {state === "success" ? (
              <div
                role="status"
                aria-live="polite"
                className="backdrop-blur-2xl bg-[var(--bg-elevated)] border border-[var(--accent)]/40 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-xl font-bold font-mono">
                  ✓
                </div>
                <h2 className="text-2xl font-serif text-[#F6F2E6]">Thank you.</h2>
                <p className="text-[var(--fg-muted)] font-sans text-base leading-relaxed">
                  Your enquiry has been received. I review every submission personally and reply within 24 hours.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-sans text-sm font-medium px-6 py-3 rounded-full hover:bg-[var(--accent-deep)] transition-colors duration-200"
                  >
                    Chat immediately on WhatsApp ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        sessionType: "",
                        message: "",
                        website: "",
                      });
                      setState("idle");
                    }}
                    className="text-xs font-mono text-[var(--fg-dim)] hover:text-[#F6F2E6] transition-colors py-3"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-6"
              >
                {/* Honeypot field — hidden from humans */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Leave this empty</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="name" className={labelClass}>Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className={inputClass}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-[var(--danger)] text-sm font-sans mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className={labelClass}>Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@domain.com"
                      required
                      className={inputClass}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-[var(--danger)] text-sm font-sans mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>Phone / WhatsApp</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0803 081 2138"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sessionType" className={labelClass}>Session type</label>
                  <select
                    id="sessionType"
                    name="sessionType"
                    value={formData.sessionType}
                    onChange={handleChange}
                    style={{ colorScheme: "dark" }}
                    className={`${inputClass} cursor-pointer bg-[#141414] text-[#F6F2E6]`}
                  >
                    <option value="" className="bg-[#141414] text-[#F6F2E6] py-2">Select...</option>
                    <option value="portrait" className="bg-[#141414] text-[#F6F2E6] py-2">Portrait</option>
                    <option value="studio" className="bg-[#141414] text-[#F6F2E6] py-2">Studio</option>
                    <option value="other" className="bg-[#141414] text-[#F6F2E6] py-2">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your shoot..."
                    rows={5}
                    required
                    className={`${inputClass} resize-none`}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="text-[var(--danger)] text-sm font-sans mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={state === "submitting"}
                    className="flex-1 bg-[var(--fg)] text-[var(--bg)] font-sans text-sm font-medium px-6 py-3 rounded-full hover:opacity-80 disabled:opacity-40 transition-all duration-200 cursor-pointer"
                    aria-live="polite"
                  >
                    {state === "submitting" ? "Sending..." : "Send message"}
                  </button>

                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-[var(--accent)] text-white font-sans text-sm font-medium px-6 py-3 rounded-full hover:bg-[var(--accent-deep)] transition-colors duration-200 cursor-pointer"
                  >
                    Chat on WhatsApp
                  </a>

                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="flex-1 text-center border border-[var(--line-strong)] text-[var(--fg)] font-sans text-sm px-6 py-3 rounded-full hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all duration-200 cursor-pointer"
                  >
                    Email directly
                  </a>
                </div>

                {state === "error" && (
                  <p className="text-[var(--danger)] text-sm font-sans" aria-live="assertive">
                    Something went wrong. Please try WhatsApp or email directly.
                  </p>
                )}

                <p className="text-[var(--fg-dim)] text-xs font-sans">
                  Your details are stored only to reply.{" "}
                  <a href="/privacy" className="underline hover:text-[var(--fg)]">
                    Privacy policy
                  </a>
                </p>
              </form>
            )}
          </div>

          {/* Right: Glassmorphic Contact Details & Editorial Portrait */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal delay={0.2} className="backdrop-blur-2xl bg-white/[0.025] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <p className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest mb-2">
                  [ L ] Location
                </p>
                <p className="text-[#F6F2E6] font-sans text-base">
                  Based in {siteConfig.city}, {siteConfig.country}
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest mb-2">
                  [ E ] Direct Email
                </p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-[#F6F2E6] font-sans hover:text-[var(--accent)] transition-colors break-all text-base"
                >
                  {siteConfig.email}
                </a>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="font-mono text-[var(--fg-dim)] text-xs uppercase tracking-widest mb-2">
                  [ W ] Fast Chat
                </p>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-text)] font-sans hover:underline transition-colors inline-flex items-center gap-1.5 text-base font-medium"
                >
                  {siteConfig.phoneDisplay}
                  <span>↗</span>
                </a>
              </div>
            </Reveal>

            {/* Editorial Portrait matching the Footer Portrait */}
            <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 hidden sm:block bg-[var(--bg-elevated)]">
              <Image
                src={getOptimizedSrc(portraitSrc, 1000)}
                alt="Zetona_E Portrait Studio"
                fill
                className="object-cover"
                sizes="(min-width:1024px) 40vw, 90vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs font-mono text-white/90 pointer-events-none">
                <span className="backdrop-blur-md bg-black/60 px-2.5 py-1 rounded border border-white/10">
                  BENIN CITY STUDIO
                </span>
                <span className="backdrop-blur-md bg-black/60 px-2.5 py-1 rounded border border-white/10">
                  AVAILABLE 2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
