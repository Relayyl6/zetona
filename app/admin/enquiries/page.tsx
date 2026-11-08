"use client";

import React, { useState, useEffect } from "react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  sessionType?: string | null;
  message: string;
  createdAt: string;
  handledAt?: string | null;
  emailStatus: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnquiries() {
      try {
        const res = await fetch("/api/admin/enquiries");
        if (res.ok) {
          const data = await res.json();
          if (data.enquiries) {
            setEnquiries(data.enquiries);
          }
        }
      } catch (err) {
        console.error("Failed to fetch enquiries:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEnquiries();
  }, []);

  const toggleHandled = async (id: string) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, handledAt: e.handledAt ? null : new Date().toISOString() } : e
      )
    );
    try {
      await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      window.dispatchEvent(new CustomEvent("admin-enquiries-changed"));
    } catch (err) {
      console.error("Failed to toggle enquiry:", err);
    }
  };

  const deleteEnquiry = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete message from "${name}"?\nThis action cannot be undone.`)) {
      return;
    }
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    try {
      const res = await fetch(`/api/admin/enquiries?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete message");
      }
      window.dispatchEvent(new CustomEvent("admin-enquiries-changed"));
    } catch (err) {
      console.error("Failed to delete enquiry:", err);
      alert("Could not delete message. Please try again.");
      // Reload on failure
      const reload = await fetch("/api/admin/enquiries");
      if (reload.ok) {
        const data = await reload.json();
        if (data.enquiries) setEnquiries(data.enquiries);
      }
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-[var(--fg)] tracking-tight">Messages</h1>
        <p className="text-xs text-[var(--fg-muted)] font-mono mt-1">
          Enquiries received through the public contact form
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-[var(--bg-elevated)] rounded-xl border border-[var(--line)]">
          <p className="text-[var(--fg-muted)] text-sm">Loading enquiries...</p>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-elevated)] rounded-xl border border-[var(--line)]">
          <p className="text-[var(--fg-muted)] text-sm">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className={`bg-[var(--bg-elevated)] border rounded-xl p-6 transition-colors ${
                enq.handledAt ? "border-[var(--line)] opacity-60" : "border-[var(--line-strong)]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-medium text-base text-[var(--fg)]">{enq.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-[var(--fg-muted)] mt-1">
                    <a href={`mailto:${enq.email}`} className="hover:text-[var(--accent)] underline">
                      {enq.email}
                    </a>
                    {enq.phone && (
                      <a
                        href={buildWhatsAppUrl(
                          `Hello ${enq.name}, thanks for reaching out to Zetona_E regarding your enquiry!`,
                          { phoneDigits: enq.phone }
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent-text)] hover:underline inline-flex items-center gap-1"
                      >
                        {enq.phone} (WhatsApp ↗)
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      enq.emailStatus === "sent"
                        ? "bg-[var(--success)]/20 text-[var(--success)]"
                        : "bg-amber-400/20 text-amber-400"
                    }`}
                  >
                    status: {enq.emailStatus}
                  </span>
                  <button
                    onClick={() => toggleHandled(enq.id)}
                    className="text-xs font-mono border border-[var(--line-strong)] px-3 py-1 rounded hover:bg-[var(--bg)] cursor-pointer transition-colors"
                  >
                    {enq.handledAt ? "Mark Unhandled" : "Mark Handled ✓"}
                  </button>
                  <button
                    onClick={() => deleteEnquiry(enq.id, enq.name)}
                    className="text-xs font-mono text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 px-2.5 py-1 rounded hover:bg-red-950/40 cursor-pointer transition-colors flex items-center gap-1"
                    title="Delete message permanently"
                  >
                    <span>Delete</span>
                    <span>✕</span>
                  </button>
                </div>
              </div>

              {enq.sessionType && (
                <div className="mb-3">
                  <span className="text-[10px] font-mono uppercase bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 rounded text-[var(--fg-muted)]">
                    Type: {enq.sessionType}
                  </span>
                </div>
              )}

              <p className="text-sm font-sans text-[var(--fg-muted)] whitespace-pre-wrap leading-relaxed">
                {enq.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
