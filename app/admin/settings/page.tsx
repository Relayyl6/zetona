"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { mockSettings, PhotoDTO, TestimonialDTO } from "@/lib/db/queries";
import { getOptimizedSrc } from "@/lib/storage/image-url";
import { getInitials } from "@/components/home/TestimonialsSection";

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

  const [photos, setPhotos] = useState<PhotoDTO[]>([]);
  const [togglingPhotoId, setTogglingPhotoId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Testimonials state
  const [testimonials, setTestimonials] = useState<TestimonialDTO[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [editAuthor, setEditAuthor] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editQuote, setEditQuote] = useState("");

  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newQuote, setNewQuote] = useState("");
  const [testimonialFeedback, setTestimonialFeedback] = useState("");
  const [savingTestimonial, setSavingTestimonial] = useState(false);

  const loadTestimonials = async () => {
    setLoadingTestimonials(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      if (res.ok) {
        const data = await res.json();
        if (data.testimonials && Array.isArray(data.testimonials)) {
          setTestimonials(data.testimonials);
        }
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleStartEdit = (t: TestimonialDTO) => {
    setEditingTestimonialId(t.id);
    setEditAuthor(t.author);
    setEditRole(t.role || "");
    setEditLocation(t.location || "");
    setEditQuote(t.quote);
  };

  const handleCancelEdit = () => {
    setEditingTestimonialId(null);
    setEditAuthor("");
    setEditRole("");
    setEditLocation("");
    setEditQuote("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editAuthor.trim() || !editQuote.trim()) {
      alert("Author name and quote are required.");
      return;
    }
    setSavingTestimonial(true);
    try {
      const payload: TestimonialDTO = {
        id,
        author: editAuthor.trim(),
        role: editRole.trim() || null,
        location: editLocation.trim() || null,
        quote: editQuote.trim(),
        visible: true,
      };

      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save testimonial");

      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...payload } : t))
      );
      setEditingTestimonialId(null);
      setTestimonialFeedback("Testimonial updated successfully!");
      setTimeout(() => setTestimonialFeedback(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to update testimonial");
    } finally {
      setSavingTestimonial(false);
    }
  };

  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newQuote.trim()) {
      alert("Please provide both author name and quote.");
      return;
    }
    setSavingTestimonial(true);
    try {
      const payload = {
        id: `test_${Date.now()}`,
        author: newAuthor.trim(),
        role: newRole.trim() || null,
        location: newLocation.trim() || null,
        quote: newQuote.trim(),
        sortOrder: testimonials.length + 1,
        visible: true,
      };

      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add testimonial");
      const data = await res.json();

      setTestimonials((prev) => [...prev, data.testimonial || payload]);
      setNewAuthor("");
      setNewRole("");
      setNewLocation("");
      setNewQuote("");
      setShowAddTestimonial(false);
      setTestimonialFeedback("New testimonial added successfully!");
      setTimeout(() => setTestimonialFeedback(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to add testimonial");
    } finally {
      setSavingTestimonial(false);
    }
  };

  const handleDeleteTestimonial = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the testimonial from ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete testimonial");

      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      setTestimonialFeedback("Testimonial removed.");
      setTimeout(() => setTestimonialFeedback(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to delete testimonial");
    }
  };

  // Load photos for the homepage photo selection manager
  useEffect(() => {
    async function loadPhotos() {
      try {
        const res = await fetch("/api/admin/photos");
        if (res.ok) {
          const data = await res.json();
          if (data.photos && Array.isArray(data.photos)) {
            setPhotos(data.photos);
          }
        }
      } catch (err) {
        console.error("Failed to load photos for settings:", err);
      }
    }
    loadPhotos();
  }, []);

  const toggleFeaturedHome = async (photoId: string, currentVal: boolean) => {
    setTogglingPhotoId(photoId);
    const newVal = !currentVal;

    // Optimistically update
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, featuredHome: newVal } : p))
    );

    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featuredHome: newVal,
          alt: "Portfolio photography by Zetona_E",
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle home photo");
    } catch (err) {
      // Revert on failure
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, featuredHome: currentVal } : p))
      );
    } finally {
      setTogglingPhotoId(null);
    }
  };

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

      {/* ──────────────── 4. FEATURED HOMEPAGE PICTURES SELECTION ──────────────── */}
      <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-sm font-medium text-[var(--fg)]">Featured Homepage Pictures Selection</h2>
            <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-0.5">
              Choose which client photos appear in the Rabah Floating Collage Hero, Split-Name Hero, and Selected Work Filmstrip
            </p>
          </div>
          <span className="font-mono text-xs bg-[var(--accent)]/15 text-[var(--accent-text)] px-3 py-1 rounded-full border border-[var(--accent)]/30 w-fit">
            {photos.filter((p) => p.featuredHome).length} Featured on Home
          </span>
        </div>

        {/* Selected Photos Reel */}
        <div>
          <span className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-3">
            Currently Featured on Homepage (Active {photos.filter((p) => p.featuredHome).length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {photos
              .filter((p) => p.featuredHome)
              .map((photo) => (
                <div
                  key={photo.id}
                  className="relative group bg-[var(--bg)] border border-[var(--accent)]/50 rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="aspect-[3/4] relative bg-black/40 overflow-hidden">
                    <Image
                      src={getOptimizedSrc(photo.displayKey, 400)}
                      alt={photo.alt || photo.title || "Featured photo"}
                      fill
                      className="object-cover"
                      sizes="(min-width:768px) 20vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <span className="text-[9px] font-mono text-emerald-400 bg-black/80 px-1 py-0.5 rounded self-start">
                        Active on Home
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFeaturedHome(photo.id, true)}
                        disabled={togglingPhotoId === photo.id}
                        className="bg-red-500/80 hover:bg-red-600 text-white text-[11px] font-sans py-1 px-2 rounded cursor-pointer transition-colors"
                      >
                        Remove ✕
                      </button>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-medium text-[var(--fg)] truncate">
                      {photo.title || "Untitled"}
                    </p>
                    <p className="text-[9px] font-mono text-[var(--fg-dim)] truncate">
                      {photo.collection?.title || "No section"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Gallery Picker (Click any photo to toggle) */}
        <div className="pt-2 border-t border-[var(--line)]">
          <span className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-2">
            Click Any Photo Below to Add or Remove from Homepage:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-96 overflow-y-auto p-1 bg-[var(--bg)]/40 rounded-lg border border-[var(--line)]">
            {photos.map((photo) => {
              const isFeatured = Boolean(photo.featuredHome);
              return (
                <button
                  type="button"
                  key={photo.id}
                  onClick={() => toggleFeaturedHome(photo.id, isFeatured)}
                  disabled={togglingPhotoId === photo.id}
                  className={`group relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    isFeatured
                      ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 scale-[0.98]"
                      : "border-transparent opacity-60 hover:opacity-100 hover:border-white/30"
                  }`}
                  title={photo.title || photo.id}
                >
                  <Image
                    src={getOptimizedSrc(photo.displayKey, 240)}
                    alt={photo.alt || photo.title || "Photo thumbnail"}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  <div className="absolute top-1 right-1">
                    {isFeatured ? (
                      <span className="w-4 h-4 bg-[var(--accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                        ✓
                      </span>
                    ) : (
                      <span className="w-4 h-4 bg-black/60 text-white/70 text-[10px] rounded-full hidden group-hover:flex items-center justify-center">
                        +
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 text-[9px] text-white truncate text-left">
                    {photo.title || "Untitled"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──────────────── 5. CLIENT TESTIMONIALS & QUOTES (PATTERN P7 / P8) ──────────────── */}
      <div id="testimonials" className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div>
            <h2 className="text-sm font-medium text-[var(--fg)] flex items-center gap-2">
              <span>Client Testimonials & Monograms</span>
              <span className="font-mono text-[10px] bg-[var(--accent)]/15 text-[var(--accent-text)] px-2.5 py-0.5 rounded-full border border-[var(--accent)]/30">
                {testimonials.length} Reviews
              </span>
            </h2>
            <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-0.5">
              Edit client praise. Photos are replaced by bold typographic initials that shine on the live site.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddTestimonial((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--accent-text)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/30 px-3.5 py-2 rounded-lg transition-colors cursor-pointer w-fit"
          >
            <span>{showAddTestimonial ? "✕ Close Form" : "+ Add Testimonial"}</span>
          </button>
        </div>

        {testimonialFeedback && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs p-3 rounded-lg flex items-center gap-2">
            <span>✓</span>
            <span>{testimonialFeedback}</span>
          </div>
        )}

        {/* Add Testimonial Form Drawer */}
        {showAddTestimonial && (
          <div className="bg-[var(--bg)] p-5 rounded-xl border border-[var(--accent)]/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg)]">
                New Testimonial
              </h3>
              {newAuthor && (
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-dim)]">
                  <span>Monogram Preview:</span>
                  <div className="w-8 h-8 rounded-lg bg-[#252525] border border-[var(--accent)]/40 text-[var(--accent-text)] font-serif font-bold flex items-center justify-center text-sm shadow">
                    {getInitials(newAuthor)}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Osasere Ighodaro"
                  required
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Editorial Lead"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1">
                  Location / Brand
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Edo Contemporary Arts"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1">
                Client Review / Quote *
              </label>
              <textarea
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                rows={3}
                placeholder="Write the client's testimonial..."
                required
                className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded-lg p-3 text-xs text-[var(--fg)] leading-relaxed focus:outline-none focus:border-[var(--accent)] font-serif"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTestimonial(false)}
                className="text-xs font-mono text-[var(--fg-dim)] hover:text-white px-3 py-1.5 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTestimonial}
                disabled={savingTestimonial || !newAuthor.trim() || !newQuote.trim()}
                className="bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingTestimonial && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Add Testimonial</span>
              </button>
            </div>
          </div>
        )}

        {/* Existing Testimonials List */}
        <div className="space-y-3">
          {testimonials.map((t, idx) => {
            const isEditing = editingTestimonialId === t.id;
            const initials = getInitials(t.author);

            if (isEditing) {
              return (
                <div
                  key={t.id}
                  className="bg-[var(--bg)] border border-[var(--accent)]/50 rounded-xl p-5 space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-xs font-mono text-[var(--accent-text)]">
                      Editing Review #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-dim)]">
                      <span>Monogram:</span>
                      <div className="w-7 h-7 rounded-md bg-[#252525] border border-[var(--accent)]/50 text-[var(--accent-text)] font-serif font-bold flex items-center justify-center text-xs">
                        {getInitials(editAuthor)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-[var(--fg-muted)] uppercase block mb-1">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[var(--fg-muted)] uppercase block mb-1">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[var(--fg-muted)] uppercase block mb-1">
                        Location / Brand
                      </label>
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[var(--fg-muted)] uppercase block mb-1">
                      Quote Text *
                    </label>
                    <textarea
                      value={editQuote}
                      onChange={(e) => setEditQuote(e.target.value)}
                      rows={3}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded p-2.5 text-xs text-[var(--fg)] font-serif leading-relaxed focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs font-mono text-[var(--fg-dim)] hover:text-white px-3 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(t.id)}
                      disabled={savingTestimonial}
                      className="bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-xs px-4 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {savingTestimonial && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={t.id}
                className="bg-[var(--bg)]/70 border border-[var(--line)] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Monogram with Big Initials */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#242424] to-[#121212] border border-[var(--accent)]/40 flex items-center justify-center font-serif text-base font-bold text-[var(--accent-text)] shadow flex-shrink-0">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h4 className="font-condensed uppercase text-sm font-medium text-[var(--fg)] tracking-wide">
                        {t.author}
                      </h4>
                      {(t.role || t.location) && (
                        <span className="text-[11px] font-sans text-[var(--fg-dim)]">
                          · {t.role} {t.location ? `(${t.location})` : ""}
                        </span>
                      )}
                    </div>
                    <p className="font-serif italic text-xs text-[var(--fg-muted)] line-clamp-2 mt-1 leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(t)}
                    className="text-[11px] font-mono text-[var(--fg-dim)] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    Edit ✎
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTestimonial(t.id, t.author)}
                    className="text-[11px] font-mono text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-500/20 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──────────────── 6. SECTION VISIBILITY TOGGLES ──────────────── */}
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
