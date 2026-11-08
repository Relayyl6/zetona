"use client";

import React, { useState, useEffect } from "react";
import { mockSettings } from "@/lib/db/queries";

function normalizeSocialUrl(
  platform: "instagram" | "facebook" | "tiktok" | "x",
  value: string
): string | null {
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("@")) {
    const handle = v.slice(1);
    switch (platform) {
      case "instagram":
        return `https://instagram.com/${handle}`;
      case "facebook":
        return `https://facebook.com/${handle}`;
      case "tiktok":
        return `https://tiktok.com/@${handle}`;
      case "x":
        return `https://x.com/${handle}`;
    }
  }
  return `https://${v.replace(/^\/+/, "")}`;
}

export default function AdminSettingsPage() {
  // Split headline into Line 1 and Line 2 so editing is crystal clear and never glues words together
  const [headlineLine1, setHeadlineLine1] = useState("Beautiful moments");
  const [headlineLine2, setHeadlineLine2] = useState("of beautiful people.");
  const [subline, setSubline] = useState(mockSettings.subline || "");
  const [bio, setBio] = useState(mockSettings.bio || "");
  const [homeVariant, setHomeVariant] = useState(mockSettings.homeVariant || "collage");

  const [showStats, setShowStats] = useState(mockSettings.showStats);
  const [showAwards, setShowAwards] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);

  const [instagram, setInstagram] = useState(mockSettings.instagramUrl || "");
  const [facebook, setFacebook] = useState(mockSettings.facebookUrl || "");
  const [tiktok, setTiktok] = useState(mockSettings.tiktokUrl || "");
  const [xUrl, setXUrl] = useState(mockSettings.xUrl || "");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load existing persistent settings on mount
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            // Parse headline into Line 1 and Line 2
            const rawHeadline = (data.settings.headline || "").replace(/\r\n/g, "\n").trim();
            if (rawHeadline.includes("\n")) {
              const parts = rawHeadline.split("\n").map((s: string) => s.trim()).filter(Boolean);
              setHeadlineLine1(parts[0] || "Beautiful moments");
              setHeadlineLine2(parts[1] || "of beautiful people.");
            } else if (rawHeadline) {
              const words = rawHeadline.split(/\s+/);
              if (words.length >= 4) {
                setHeadlineLine1(words.slice(0, 2).join(" "));
                setHeadlineLine2(words.slice(2).join(" "));
              } else {
                setHeadlineLine1(rawHeadline);
                setHeadlineLine2("");
              }
            }

            setSubline(data.settings.subline ?? "");
            setBio(data.settings.bio ?? "");
            setHomeVariant(data.settings.homeVariant ?? "collage");
            setShowStats(Boolean(data.settings.showStats));
            setShowAwards(data.settings.showAwards !== false);
            setShowTestimonials(data.settings.showTestimonials !== false);
            setInstagram(data.settings.instagramUrl ?? "");
            setFacebook(data.settings.facebookUrl ?? "");
            setTiktok(data.settings.tiktokUrl ?? "");
            setXUrl(data.settings.xUrl ?? "");
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Assemble headline from the two clean lines
      const combinedHeadline = [headlineLine1.trim(), headlineLine2.trim()]
        .filter(Boolean)
        .join("\n");

      const normalizedInstagram = normalizeSocialUrl("instagram", instagram);
      const normalizedFacebook = normalizeSocialUrl("facebook", facebook);
      const normalizedTiktok = normalizeSocialUrl("tiktok", tiktok);
      const normalizedX = normalizeSocialUrl("x", xUrl);

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: combinedHeadline,
          subline: subline.trim() || null,
          bio: bio.trim() || null,
          homeVariant,
          showStats,
          showAwards,
          showTestimonials,
          instagramUrl: normalizedInstagram,
          facebookUrl: normalizedFacebook,
          tiktokUrl: normalizedTiktok,
          xUrl: normalizedX,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to persist settings");
      }

      const data = await res.json();
      if (data.settings) {
        setInstagram(data.settings.instagramUrl ?? "");
        setFacebook(data.settings.facebookUrl ?? "");
        setTiktok(data.settings.tiktokUrl ?? "");
        setXUrl(data.settings.xUrl ?? "");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4500);
    } catch (err: any) {
      setError(err.message || "Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} noValidate className="max-w-3xl space-y-8">
      {/* Top Header & Save Button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[var(--fg)] tracking-tight">Site Settings</h1>
          <p className="text-xs text-[var(--fg-muted)] font-mono mt-1">
            Edit live site copy, headline lines, social channels, and section visibility
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-xs font-medium px-6 py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-lg"
        >
          {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <span>{saved ? "Saved to Site ✓" : "Save Settings"}</span>
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs p-4 rounded-xl flex items-center gap-2 shadow-lg">
          <span className="font-bold text-sm">✓</span>
          <span>Settings saved successfully and updated live across the website!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/50 border border-red-500/50 text-red-200 text-xs p-4 rounded-xl shadow-lg">
          ⚠️ {error}
        </div>
      )}

      {/* ──────────────── 1. HERO HEADLINES & SUBLINE ──────────────── */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-6">
        <div className="border-b border-[var(--line)] pb-3">
          <h2 className="text-sm font-medium text-[var(--fg)]">Home Hero Headline (2-Line Editorial Lockup)</h2>
          <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-1">
            Separated into Line 1 and Line 2 so you have full control over the exact layout
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1.5">
              Headline — Line 1 *
            </label>
            <input
              type="text"
              value={headlineLine1}
              onChange={(e) => setHeadlineLine1(e.target.value)}
              placeholder="e.g. Beautiful moments"
              required
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] font-serif text-base focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1.5">
              Headline — Line 2 *
            </label>
            <input
              type="text"
              value={headlineLine2}
              onChange={(e) => setHeadlineLine2(e.target.value)}
              placeholder="e.g. of beautiful people."
              required
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] font-serif text-base focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* Live Typography Preview */}
        <div className="bg-[var(--bg)]/70 border border-white/5 rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--fg-dim)] block mb-1">
            Live Preview on Hero:
          </span>
          <p className="font-serif text-xl sm:text-2xl text-[var(--fg)] leading-tight tracking-tight">
            <span className="block">{headlineLine1 || "(Line 1)"}</span>
            <span className="block">{headlineLine2 || "(Line 2)"}</span>
          </p>
        </div>

        <div>
          <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1.5">
            Home Hero Subline (Location & Studio Note)
          </label>
          <input
            type="text"
            value={subline}
            onChange={(e) => setSubline(e.target.value)}
            placeholder="e.g. Studio & portrait photography in Benin City • Available Worldwide"
            className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {/* ──────────────── 2. ABOUT BIO ──────────────── */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-4">
        <div className="border-b border-[var(--line)] pb-3">
          <h2 className="text-sm font-medium text-[var(--fg)]">About Bio & Philosophy</h2>
          <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-1">
            Separate paragraphs with a blank line for the scroll-lit storytelling effect
          </p>
        </div>

        <div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={7}
            placeholder="Write your story, artistic approach, and portrait philosophy..."
            className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg p-4 text-sm text-[var(--fg)] leading-relaxed focus:outline-none focus:border-[var(--accent)] resize-y font-sans"
          />
        </div>
      </div>

      {/* ──────────────── 3. SOCIAL CHANNELS ──────────────── */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-5">
        <div className="border-b border-[var(--line)] pb-3">
          <h2 className="text-sm font-medium text-[var(--fg)]">Social Media Profiles</h2>
          <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-1">
            You can enter full links or simple handles (e.g. @zetona_e). Leave blank to hide from footer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1.5">
              Instagram
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="e.g. @zetona_e or instagram.com/zetona_e"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1.5">
              Facebook
            </label>
            <input
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="e.g. facebook.com/zetona_e"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1.5">
              TikTok
            </label>
            <input
              type="text"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="e.g. @zetona_e or tiktok.com/@zetona_e"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1.5">
              X (Twitter)
            </label>
            <input
              type="text"
              value={xUrl}
              onChange={(e) => setXUrl(e.target.value)}
              placeholder="e.g. @zetona_e or x.com/zetona_e"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* ──────────────── 4. SECTION VISIBILITY TOGGLES ──────────────── */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-5">
        <div className="border-b border-[var(--line)] pb-3">
          <h2 className="text-sm font-medium text-[var(--fg)]">Section Visibility Toggles</h2>
          <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-1">
            Turn sections on or off on the live homepage with a single click
          </p>
        </div>

        <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg)]/50 border border-[var(--line)] hover:border-white/20 transition-colors cursor-pointer">
          <div>
            <p className="text-sm font-medium text-[var(--fg)]">Awards & Honorable Mentions</p>
            <p className="text-xs text-[var(--fg-muted)] font-mono mt-0.5">
              Interactive hover-reveal sessions and exhibitions list
            </p>
          </div>
          <input
            type="checkbox"
            checked={showAwards}
            onChange={(e) => setShowAwards(e.target.checked)}
            className="w-5 h-5 accent-[var(--accent)] cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg)]/50 border border-[var(--line)] hover:border-white/20 transition-colors cursor-pointer">
          <div>
            <p className="text-sm font-medium text-[var(--fg)]">Client Testimonials & Quotes</p>
            <p className="text-xs text-[var(--fg-muted)] font-mono mt-0.5">
              Quotes, client praise, and client avatar bar
            </p>
          </div>
          <input
            type="checkbox"
            checked={showTestimonials}
            onChange={(e) => setShowTestimonials(e.target.checked)}
            className="w-5 h-5 accent-[var(--accent)] cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg)]/50 border border-[var(--line)] hover:border-white/20 transition-colors cursor-pointer">
          <div>
            <p className="text-sm font-medium text-[var(--fg)]">Stats & Numerical Milestones</p>
            <p className="text-xs text-[var(--fg-muted)] font-mono mt-0.5">
              Year counters and gallery metric badges
            </p>
          </div>
          <input
            type="checkbox"
            checked={showStats}
            onChange={(e) => setShowStats(e.target.checked)}
            className="w-5 h-5 accent-[var(--accent)] cursor-pointer"
          />
        </label>
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-sm font-medium px-8 py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xl"
        >
          {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <span>{saved ? "Saved to Site ✓" : "Save All Settings"}</span>
        </button>
      </div>
    </form>
  );
}
