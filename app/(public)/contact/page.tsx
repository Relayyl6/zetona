"use client";

import React, { useState } from "react";
import { z } from "zod";
import { enquirySchema } from "@/lib/validators/enquiry";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site-config";
import { Reveal } from "@/components/motion/Reveal";
import { MaskLines } from "@/components/motion/MaskLines";
import { m } from "motion/react";

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

export default function ContactPage() {
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

    // Stub: in production this posts to /api/enquiries
    await new Promise((r) => setTimeout(r, 1000));
    setState("success");
  };

  const clientAvatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80",
  ];

  const inputClass =
    "w-full bg-white/[0.03] border-b border-white/20 text-[#F6F2E6] font-sans text-base px-3 py-3 rounded-t focus:outline-none focus:border-[var(--accent)] focus:bg-white/[0.06] placeholder:text-[var(--fg-dim)] transition-colors duration-200";
  const labelClass = "text-[var(--fg-muted)] text-xs font-sans uppercase tracking-widest mb-1.5 block";

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg)] pt-16 pb-20">
      {/* Top Client Avatars Bar matching Image 2 */}
      <div className="px-6 md:px-12 pt-6 pb-2 flex items-center gap-3 overflow-x-auto no-scrollbar">
        {clientAvatars.map((src, i) => (
          <div
            key={i}
            className="w-9 h-9 md:w-10 md:h-10 rounded overflow-hidden relative opacity-75 ring-1 ring-white/10"
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        <span className="font-mono text-xs text-[var(--fg-dim)] ml-2">
          [ Selected Clients & Collaborations ]
        </span>
      </div>

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
              <m.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-2xl bg-white/[0.04] border border-white/15 rounded-2xl p-8 md:p-10 shadow-2xl"
              >
                <p className="text-[#F6F2E6] font-serif text-2xl mb-4">
                  Thank you. Your message is in.
                </p>
                <p className="text-[var(--fg-muted)] text-sm font-sans mb-6">
                  I&apos;ll reply soon. For immediate scheduling, you can also connect on WhatsApp.
                </p>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-sans px-6 py-3 rounded-full hover:bg-[var(--accent-deep)] transition-colors shadow-lg"
                >
                  Chat on WhatsApp ↗
                </a>
              </m.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="backdrop-blur-2xl bg-white/[0.025] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6"
              >
                {/* Honeypot — invisible to users */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ display: "none" }}
                />

                <div>
                  <label htmlFor="name" className={labelClass}>Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    className={inputClass}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-[var(--danger)] text-sm font-sans">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hello@example.com"
                    autoComplete="email"
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
                  <label htmlFor="phone" className={labelClass}>Phone (optional)</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234..."
                    autoComplete="tel"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="sessionType" className={labelClass}>Type of Session</label>
                  <select
                    id="sessionType"
                    name="sessionType"
                    value={formData.sessionType}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">Select...</option>
                    <option value="portrait">Portrait</option>
                    <option value="studio">Studio</option>
                    <option value="other">Other</option>
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
                    className="flex-1 bg-[var(--fg)] text-[var(--bg)] font-sans text-sm font-medium px-6 py-3 rounded-full hover:opacity-80 disabled:opacity-40 transition-all duration-200"
                    aria-live="polite"
                  >
                    {state === "submitting" ? "Sending..." : "Send message"}
                  </button>

                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-[var(--accent)] text-white font-sans text-sm font-medium px-6 py-3 rounded-full hover:bg-[var(--accent-deep)] transition-colors duration-200"
                  >
                    Chat on WhatsApp
                  </a>

                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="flex-1 text-center border border-[var(--line-strong)] text-[var(--fg)] font-sans text-sm px-6 py-3 rounded-full hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all duration-200"
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

            {/* Editorial Portrait matching Image 2 */}
            <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80"
                alt="Zetona_E Portrait Studio"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs font-mono text-white/90">
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
