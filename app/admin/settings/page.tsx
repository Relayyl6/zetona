"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { mockSettings, PhotoDTO, TestimonialDTO, AwardItemDTO } from "@/lib/db/queries";
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
  const [selectedHomeCardId, setSelectedHomeCardId] = useState<string | null>(null);

  // Per-section home picture configurations
  const [homeHeroPhotoIds, setHomeHeroPhotoIds] = useState<string[]>([]);
  const [homeSplitPhotoIds, setHomeSplitPhotoIds] = useState<string[]>([]);
  const [homeAwardsList, setHomeAwardsList] = useState<AwardItemDTO[]>([]);
  const [homeFilmstripPhotoIds, setHomeFilmstripPhotoIds] = useState<string[]>([]);
  const [footerPhotoId, setFooterPhotoId] = useState<string | null>(null);

  // Active award index currently choosing a photo in modal
  const [selectingPhotoForAwardIndex, setSelectingPhotoForAwardIndex] = useState<number | null>(null);

  const toggleHeroPhoto = (photoId: string) => {
    setHomeHeroPhotoIds((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  const toggleSplitPhoto = (photoId: string) => {
    setHomeSplitPhotoIds((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  const toggleFilmstripPhoto = (photoId: string) => {
    setHomeFilmstripPhotoIds((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  const handleSetFooterPhoto = (photoId: string) => {
    setFooterPhotoId(photoId);
  };

  const handleUpdateAward = (index: number, field: "title" | "year", value: string) => {
    setHomeAwardsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSetAwardPhoto = (index: number, photoId: string) => {
    setHomeAwardsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], photoId };
      return copy;
    });
    setSelectingPhotoForAwardIndex(null);
  };

  const handleAddAward = () => {
    const newAward: AwardItemDTO = {
      id: `ses_${Date.now()}`,
      title: "NEW RECOGNITION",
      year: new Date().getFullYear().toString(),
      photoId: photos[0]?.id || null,
    };
    setHomeAwardsList((prev) => [...prev, newAward]);
  };

  const handleDeleteAward = (index: number) => {
    setHomeAwardsList((prev) => prev.filter((_, i) => i !== index));
  };

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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("admin-testimonials-changed"));
      }
      setTimeout(() => setTestimonialFeedback(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to delete testimonial");
    }
  };

  const handleApproveTestimonial = async (id: string, authorName: string) => {
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, visible: true, status: "approved" }),
      });
      if (!res.ok) throw new Error("Failed to approve review");
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: true, status: "approved" } : t))
      );
      setTestimonialFeedback(`Review from ${authorName} approved and published to portfolio!`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("admin-testimonials-changed"));
      }
      setTimeout(() => setTestimonialFeedback(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to approve review");
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
            // Initialize section defaults if not already populated from settings
            setHomeHeroPhotoIds((prev) => (prev.length > 0 ? prev : data.photos.filter((p: any) => p.featuredHome).map((p: any) => p.id)));
            setHomeSplitPhotoIds((prev) => (prev.length > 0 ? prev : data.photos.filter((p: any) => p.featuredHome).slice(0, 3).map((p: any) => p.id)));
            setHomeFilmstripPhotoIds((prev) => (prev.length > 0 ? prev : data.photos.filter((p: any) => p.featuredHome).map((p: any) => p.id)));
            setFooterPhotoId((prev) => prev || data.photos[0]?.id || null);
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

            // 1. Hero photos
            if (Array.isArray(data.settings.homeHeroPhotoIds) && data.settings.homeHeroPhotoIds.length > 0) {
              setHomeHeroPhotoIds(data.settings.homeHeroPhotoIds);
            }

            // 2. Split hero photos
            if (Array.isArray(data.settings.homeSplitPhotoIds) && data.settings.homeSplitPhotoIds.length > 0) {
              setHomeSplitPhotoIds(data.settings.homeSplitPhotoIds);
            }

            // 3. Awards list
            if (Array.isArray(data.settings.homeAwardsList) && data.settings.homeAwardsList.length > 0) {
              setHomeAwardsList(data.settings.homeAwardsList);
            } else {
              setHomeAwardsList([
                { id: "ses_01", title: "HONORABLE MENTION", year: "2026", photoId: null },
                { id: "ses_02", title: "SHORTLISTED PORTRAITURE", year: "2025", photoId: null },
                { id: "ses_03", title: "FEATURED EDITORIAL", year: "2025", photoId: null },
                { id: "ses_04", title: "COMMUNICATION ARTS", year: "2024", photoId: null },
                { id: "ses_05", title: "THE QUIET CITY", year: "2024", photoId: null },
                { id: "ses_06", title: "PROFESSIONAL COMPETITION", year: "2023", photoId: null },
                { id: "ses_07", title: "FINE ART PHOTOGRAPHY", year: "2022", photoId: null },
                { id: "ses_08", title: "GOLD AWARD NIGERIA", year: "2021", photoId: null },
              ]);
            }

            // 4. Filmstrip photos
            if (Array.isArray(data.settings.homeFilmstripPhotoIds) && data.settings.homeFilmstripPhotoIds.length > 0) {
              setHomeFilmstripPhotoIds(data.settings.homeFilmstripPhotoIds);
            }

            // 5. Footer photo
            if (data.settings.footerPhotoId) {
              setFooterPhotoId(data.settings.footerPhotoId);
            }
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
          homeHeroPhotoIds,
          homeSplitPhotoIds,
          homeAwardsList,
          homeFilmstripPhotoIds,
          footerPhotoId,
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
            Edit per-section home pictures, headline lines, reviews, bio, and social channels
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

      {/* Quick Jump Navigation Pill Bar */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-xl p-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-mono">
        <span className="text-[var(--fg-dim)] uppercase text-[10px] pl-1 pr-1 font-bold whitespace-nowrap">
          Jump to:
        </span>
        <a href="#hero-collage" className="px-2.5 py-1 rounded bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--accent)] text-[var(--fg-muted)] hover:text-white whitespace-nowrap transition-colors">
          1. Hero Collage
        </a>
        <a href="#split-hero" className="px-2.5 py-1 rounded bg-[var(--bg)] border border-[var(--line)] hover:border-purple-500 text-[var(--fg-muted)] hover:text-white whitespace-nowrap transition-colors">
          2. Split-Name Hero
        </a>
        <a href="#awards-section" className="px-2.5 py-1 rounded bg-[var(--bg)] border border-[var(--line)] hover:border-amber-500 text-[var(--fg-muted)] hover:text-white whitespace-nowrap transition-colors">
          3. Awards Showcase
        </a>
        <a href="#filmstrip-section" className="px-2.5 py-1 rounded bg-[var(--bg)] border border-[var(--line)] hover:border-emerald-500 text-[var(--fg-muted)] hover:text-white whitespace-nowrap transition-colors">
          4. Selected Work Filmstrip
        </a>
        <a href="#footer-portrait-section" className="px-2.5 py-1 rounded bg-[var(--bg)] border border-[var(--line)] hover:border-blue-500 text-[var(--fg-muted)] hover:text-white whitespace-nowrap transition-colors">
          5. Footer Portrait
        </a>
        <a href="#testimonials" className="px-2.5 py-1 rounded bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--accent)] text-[var(--fg-muted)] hover:text-white whitespace-nowrap transition-colors">
          6. Testimonials
        </a>
        <a href="#copy-section" className="px-2.5 py-1 rounded bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--accent)] text-[var(--fg-muted)] hover:text-white whitespace-nowrap transition-colors">
          7. Headlines &amp; Text
        </a>
        <a href="#social-section" className="px-2.5 py-1 rounded bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--accent)] text-[var(--fg-muted)] hover:text-white whitespace-nowrap transition-colors">
          8. Socials
        </a>
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

      {/* ──────────────── SECTION 1: HERO FLOATING COLLAGE PICTURES ──────────────── */}
      <div id="hero-collage" className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-[var(--accent)]/15 text-[var(--accent-text)] px-2 py-0.5 rounded font-semibold uppercase">
                Section 1 • Hero
              </span>
              <h2 className="text-sm font-medium text-[var(--fg)]">Floating Collage Pictures</h2>
            </div>
            <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-0.5">
              Photographs that float dynamically around the headline on desktop &amp; form the touch swipe carousel on mobile (6–12 recommended)
            </p>
          </div>
          <span className="font-mono text-xs bg-[var(--accent)]/15 text-[var(--accent-text)] px-3 py-1 rounded-full border border-[var(--accent)]/30 w-fit whitespace-nowrap shrink-0">
            {homeHeroPhotoIds.length} in Hero Collage
          </span>
        </div>

        {/* Selected Photos Reel for Hero Collage */}
        <div>
          <span className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-3">
            Currently in Hero Collage ({homeHeroPhotoIds.length})
          </span>
          {homeHeroPhotoIds.length === 0 ? (
            <p className="text-xs text-[var(--fg-dim)] font-mono italic p-4 bg-[var(--bg)]/50 rounded-lg border border-[var(--line)]">
              No photos assigned yet. Click photos in the gallery below to add them to the Hero Collage.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {homeHeroPhotoIds.map((photoId, idx) => {
                const photo = photos.find((p) => p.id === photoId);
                if (!photo) return null;
                return (
                  <div
                    key={photo.id}
                    className="relative group bg-[var(--bg)] border border-[var(--accent)]/40 hover:border-[var(--accent)] rounded-lg overflow-hidden shadow-sm transition-all"
                  >
                    <div className="aspect-[3/4] relative bg-black/40 overflow-hidden">
                      <Image
                        src={getOptimizedSrc(photo.displayKey, 400)}
                        alt={photo.alt || photo.title || "Hero photo"}
                        fill
                        className="object-cover"
                        sizes="(min-width:768px) 20vw, 33vw"
                      />
                      <div className="absolute top-1.5 left-1.5 font-mono text-[10px] bg-black/80 text-white px-1.5 py-0.5 rounded border border-white/10">
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="p-2 flex items-center justify-between gap-1 border-t border-[var(--line)]">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-[var(--fg)] truncate">
                          {photo.title || "Untitled"}
                        </p>
                        <p className="text-[9px] font-mono text-[var(--fg-dim)] truncate">
                          {photo.collection?.title || "Hero Slot"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleHeroPhoto(photo.id)}
                        className="shrink-0 text-[10px] font-mono text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        title="Remove from Hero Collage"
                      >
                        Remove ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gallery Picker for Hero Collage */}
        <div className="pt-2 border-t border-[var(--line)]">
          <span className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-2">
            Click Any Photo Below to Add or Remove from Hero Floating Collage:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-80 overflow-y-auto p-1 bg-[var(--bg)]/40 rounded-lg border border-[var(--line)]">
            {photos.map((photo) => {
              const isSelected = homeHeroPhotoIds.includes(photo.id);
              return (
                <button
                  type="button"
                  key={photo.id}
                  onClick={() => toggleHeroPhoto(photo.id)}
                  className={`group relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 scale-[0.98]"
                      : "border-transparent opacity-75 hover:opacity-100 hover:border-white/30"
                  }`}
                  title={photo.title || photo.id}
                >
                  <Image
                    src={getOptimizedSrc(photo.displayKey, 240)}
                    alt={photo.alt || photo.title || "Photo"}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  <div className="absolute top-1 right-1">
                    {isSelected ? (
                      <span className="w-5 h-5 bg-[var(--accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 bg-black/60 text-white/80 border border-white/20 text-[10px] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        +
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 p-1 text-[9px] text-white truncate text-left font-mono">
                    {photo.title || "Untitled"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──────────────── SECTION 2: SPLIT-NAME HERO CENTER PORTRAIT(S) ──────────────── */}
      <div id="split-hero" className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded font-semibold uppercase">
                Section 2 • Split-Name
              </span>
              <h2 className="text-sm font-medium text-[var(--fg)]">ZETONA ... _E Center Focal Portrait(s)</h2>
            </div>
            <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-0.5">
              The focal portrait(s) positioned between giant &apos;ZETONA&apos; and &apos;_E&apos;. If multiple are chosen, the central crop frame cycles between them.
            </p>
          </div>
          <span className="font-mono text-xs bg-purple-500/15 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 w-fit whitespace-nowrap shrink-0">
            {homeSplitPhotoIds.length} Focal Portraits
          </span>
        </div>

        {/* Selected Photos for Split-Name Hero */}
        <div>
          <span className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-3">
            Center Crop Focal Portrait(s) ({homeSplitPhotoIds.length})
          </span>
          {homeSplitPhotoIds.length === 0 ? (
            <p className="text-xs text-[var(--fg-dim)] font-mono italic p-4 bg-[var(--bg)]/50 rounded-lg border border-[var(--line)]">
              No focal portrait assigned yet. Click photos below to assign them to the ZETONA central crop window.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {homeSplitPhotoIds.map((photoId, idx) => {
                const photo = photos.find((p) => p.id === photoId);
                if (!photo) return null;
                return (
                  <div
                    key={photo.id}
                    className="relative group bg-[var(--bg)] border border-purple-500/40 hover:border-purple-400 rounded-lg overflow-hidden shadow-sm transition-all"
                  >
                    <div className="aspect-[4/5] relative bg-black/40 overflow-hidden">
                      <Image
                        src={getOptimizedSrc(photo.displayKey, 400)}
                        alt={photo.alt || photo.title || "Split-name focal photo"}
                        fill
                        className="object-cover"
                        sizes="(min-width:768px) 20vw, 33vw"
                      />
                      <div className="absolute top-1.5 left-1.5 font-mono text-[10px] bg-black/80 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">
                        Focal #{idx + 1}
                      </div>
                    </div>
                    <div className="p-2 flex items-center justify-between gap-1 border-t border-[var(--line)]">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-[var(--fg)] truncate">
                          {photo.title || "Untitled"}
                        </p>
                        <p className="text-[9px] font-mono text-[var(--fg-dim)] truncate">
                          Focal Frame
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSplitPhoto(photo.id)}
                        className="shrink-0 text-[10px] font-mono text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        title="Remove from Center Frame"
                      >
                        Remove ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gallery Picker for Split-Name Hero */}
        <div className="pt-2 border-t border-[var(--line)]">
          <span className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-2">
            Click Any Photo Below to Add or Remove as a Center Focal Portrait:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-80 overflow-y-auto p-1 bg-[var(--bg)]/40 rounded-lg border border-[var(--line)]">
            {photos.map((photo) => {
              const isSelected = homeSplitPhotoIds.includes(photo.id);
              return (
                <button
                  type="button"
                  key={photo.id}
                  onClick={() => toggleSplitPhoto(photo.id)}
                  className={`group relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-purple-500 ring-2 ring-purple-500/30 scale-[0.98]"
                      : "border-transparent opacity-75 hover:opacity-100 hover:border-white/30"
                  }`}
                  title={photo.title || photo.id}
                >
                  <Image
                    src={getOptimizedSrc(photo.displayKey, 240)}
                    alt={photo.alt || photo.title || "Photo"}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  <div className="absolute top-1 right-1">
                    {isSelected ? (
                      <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 bg-black/60 text-white/80 border border-white/20 text-[10px] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        +
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 p-1 text-[9px] text-white truncate text-left font-mono">
                    {photo.title || "Untitled"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──────────────── SECTION 3: AWARDS & EDITORIAL SHOWCASE (HOVER-REVEAL) ──────────────── */}
      <div id="awards-section" className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded font-semibold uppercase">
                Section 3 • Awards List
              </span>
              <h2 className="text-sm font-medium text-[var(--fg)]">Awards &amp; Editorial Showcase (&quot;MY AWARDS&quot;)</h2>
            </div>
            <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-0.5">
              Edit each award title, year, and select the EXACT photograph that reveals when hovered on desktop or tapped on mobile
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            <span className="font-mono text-xs bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 w-fit whitespace-nowrap shrink-0">
              {homeAwardsList.length} Awards
            </span>
            <button
              type="button"
              onClick={handleAddAward}
              className="text-xs font-mono text-[var(--accent-text)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              + Add Award
            </button>
          </div>
        </div>

        {/* Awards Items List */}
        <div className="space-y-3">
          {homeAwardsList.map((award, idx) => {
            const assignedPhoto = award.photoId ? photos.find((p) => p.id === award.photoId) : null;

            return (
              <div
                key={award.id || idx}
                className="bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Photo Thumbnail Button / Trigger */}
                  <button
                    type="button"
                    onClick={() => setSelectingPhotoForAwardIndex(idx)}
                    className="relative w-14 h-18 sm:w-16 sm:h-20 aspect-[3/4] rounded-lg overflow-hidden border border-white/20 bg-black/50 shrink-0 group cursor-pointer"
                    title="Click to change photo"
                  >
                    {assignedPhoto ? (
                      <>
                        <Image
                          src={getOptimizedSrc(assignedPhoto.displayKey, 200)}
                          alt={assignedPhoto.title || "Award image"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-mono text-center p-1">
                          Change 📷
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[9px] font-mono text-[var(--accent-text)] p-1 text-center bg-[var(--accent)]/10">
                        <span>+ Pick</span>
                        <span>Photo</span>
                      </div>
                    )}
                  </button>

                  {/* Title & Year Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 min-w-0">
                    <div>
                      <label className="text-[10px] font-mono text-[var(--fg-dim)] uppercase block mb-1">
                        Award / Feature Title *
                      </label>
                      <input
                        type="text"
                        value={award.title}
                        onChange={(e) => handleUpdateAward(idx, "title", e.target.value)}
                        placeholder="e.g. HONORABLE MENTION"
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--fg)] font-medium focus:outline-none focus:border-[var(--accent)] uppercase"
                      />
                    </div>
                    <div className="w-full sm:w-28">
                      <label className="text-[10px] font-mono text-[var(--fg-dim)] uppercase block mb-1">
                        Year *
                      </label>
                      <input
                        type="text"
                        value={award.year}
                        onChange={(e) => handleUpdateAward(idx, "year", e.target.value)}
                        placeholder="2026"
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--fg)] font-mono focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectingPhotoForAwardIndex(idx)}
                    className="text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] bg-[var(--bg-elevated)] border border-[var(--line)] px-2.5 py-1.5 rounded cursor-pointer"
                  >
                    Change Photo 📷
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAward(idx)}
                    className="text-xs font-mono text-red-400 hover:text-red-300 bg-red-950/40 border border-red-500/30 px-2.5 py-1.5 rounded cursor-pointer"
                    title="Delete award item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──────────────── SECTION 4: SELECTED WORK FILMSTRIP CAROUSEL ──────────────── */}
      <div id="filmstrip-section" className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded font-semibold uppercase">
                Section 4 • Filmstrip
              </span>
              <h2 className="text-sm font-medium text-[var(--fg)]">Selected Work Filmstrip Carousel</h2>
            </div>
            <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-0.5">
              Photographs featured in the interactive horizontal filmstrip carousel at the base of the homepage before the footer
            </p>
          </div>
          <span className="font-mono text-xs bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 w-fit whitespace-nowrap shrink-0">
            {homeFilmstripPhotoIds.length} in Filmstrip
          </span>
        </div>

        {/* Selected Photos Reel for Filmstrip */}
        <div>
          <span className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-3">
            Currently in Filmstrip Reel ({homeFilmstripPhotoIds.length})
          </span>
          {homeFilmstripPhotoIds.length === 0 ? (
            <p className="text-xs text-[var(--fg-dim)] font-mono italic p-4 bg-[var(--bg)]/50 rounded-lg border border-[var(--line)]">
              No photos assigned yet. Click photos in the gallery below to add them to the Selected Work filmstrip.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {homeFilmstripPhotoIds.map((photoId, idx) => {
                const photo = photos.find((p) => p.id === photoId);
                if (!photo) return null;
                return (
                  <div
                    key={photo.id}
                    className="relative group bg-[var(--bg)] border border-emerald-500/40 hover:border-emerald-400 rounded-lg overflow-hidden shadow-sm transition-all"
                  >
                    <div className="aspect-[3/4] relative bg-black/40 overflow-hidden">
                      <Image
                        src={getOptimizedSrc(photo.displayKey, 400)}
                        alt={photo.alt || photo.title || "Filmstrip photo"}
                        fill
                        className="object-cover"
                        sizes="(min-width:768px) 20vw, 33vw"
                      />
                      <div className="absolute top-1.5 left-1.5 font-mono text-[10px] bg-black/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Reel #{idx + 1}
                      </div>
                    </div>
                    <div className="p-2 flex items-center justify-between gap-1 border-t border-[var(--line)]">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-[var(--fg)] truncate">
                          {photo.title || "Untitled"}
                        </p>
                        <p className="text-[9px] font-mono text-[var(--fg-dim)] truncate">
                          {photo.collection?.title || "Selected Work"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFilmstripPhoto(photo.id)}
                        className="shrink-0 text-[10px] font-mono text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        title="Remove from Filmstrip"
                      >
                        Remove ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gallery Picker for Filmstrip */}
        <div className="pt-2 border-t border-[var(--line)]">
          <span className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-2">
            Click Any Photo Below to Add or Remove from the Filmstrip Reel:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-80 overflow-y-auto p-1 bg-[var(--bg)]/40 rounded-lg border border-[var(--line)]">
            {photos.map((photo) => {
              const isSelected = homeFilmstripPhotoIds.includes(photo.id);
              return (
                <button
                  type="button"
                  key={photo.id}
                  onClick={() => toggleFilmstripPhoto(photo.id)}
                  className={`group relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500/30 scale-[0.98]"
                      : "border-transparent opacity-75 hover:opacity-100 hover:border-white/30"
                  }`}
                  title={photo.title || photo.id}
                >
                  <Image
                    src={getOptimizedSrc(photo.displayKey, 240)}
                    alt={photo.alt || photo.title || "Photo"}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  <div className="absolute top-1 right-1">
                    {isSelected ? (
                      <span className="w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 bg-black/60 text-white/80 border border-white/20 text-[10px] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        +
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 p-1 text-[9px] text-white truncate text-left font-mono">
                    {photo.title || "Untitled"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──────────────── SECTION 5: FOOTER EDITORIAL PORTRAIT ──────────────── */}
      <div id="footer-portrait-section" className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded font-semibold uppercase">
                Section 5 • Footer
              </span>
              <h2 className="text-sm font-medium text-[var(--fg)]">Footer Editorial Portrait (&quot;LET&apos;S TALK.&quot;)</h2>
            </div>
            <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-0.5">
              Choose the full-height portrait showcased on the right side of the full-screen footer across the website
            </p>
          </div>
          <span className="font-mono text-xs bg-blue-500/15 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 w-fit whitespace-nowrap shrink-0">
            1 Active Portrait
          </span>
        </div>

        {/* Active Footer Portrait Preview */}
        {(() => {
          const activeFooterPhoto = footerPhotoId ? photos.find((p) => p.id === footerPhotoId) : photos[0];
          return (
            <div className="bg-[var(--bg)] border border-[var(--line)] rounded-xl p-4 sm:p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-lg overflow-hidden bg-black/60 border-2 border-[var(--accent)] shadow-2xl shrink-0">
                {activeFooterPhoto ? (
                  <Image
                    src={getOptimizedSrc(activeFooterPhoto.displayKey, 600)}
                    alt="Footer Portrait"
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[var(--fg-dim)]">
                    No photo selected
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-[var(--accent)] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                  Active in Footer ✓
                </div>
              </div>

              <div className="flex-1 space-y-2 text-center md:text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--fg-dim)] block">
                  Current Footer Portrait
                </span>
                <h3 className="text-lg font-serif text-[var(--fg)]">
                  {activeFooterPhoto?.title || "Editorial Portrait"}
                </h3>
                <p className="text-xs text-[var(--fg-muted)] font-mono">
                  {activeFooterPhoto?.collection?.title || "Zetona Portrait Session"}
                </p>
                <p className="text-[11px] text-[var(--fg-dim)] font-mono pt-2">
                  Click any photo in the library below to switch the footer portrait instantly!
                </p>
              </div>
            </div>
          );
        })()}

        {/* Gallery Picker for Footer Portrait */}
        <div className="pt-2 border-t border-[var(--line)]">
          <span className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-2">
            Click Any Photo Below to Set as the Active Footer Portrait:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-80 overflow-y-auto p-1 bg-[var(--bg)]/40 rounded-lg border border-[var(--line)]">
            {photos.map((photo) => {
              const isCurrent = footerPhotoId === photo.id;
              return (
                <button
                  type="button"
                  key={photo.id}
                  onClick={() => handleSetFooterPhoto(photo.id)}
                  className={`group relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    isCurrent
                      ? "border-[var(--accent)] ring-4 ring-[var(--accent)]/40 scale-[0.98]"
                      : "border-transparent opacity-75 hover:opacity-100 hover:border-white/30"
                  }`}
                  title={`Set ${photo.title || photo.id} as Footer Portrait`}
                >
                  <Image
                    src={getOptimizedSrc(photo.displayKey, 240)}
                    alt={photo.alt || photo.title || "Photo"}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  {isCurrent && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-[var(--accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                      ✓
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 p-1 text-[9px] text-white truncate text-left font-mono">
                    {photo.title || "Untitled"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──────────────── 5. CLIENT TESTIMONIALS & QUOTES (PATTERN P7 / P8) ──────────────── */}
      {(() => {
        const pendingTestimonials = testimonials.filter(
          (t) => t.status === "pending" || t.visible === false
        );
        const publishedTestimonials = testimonials.filter(
          (t) => t.status !== "pending" && t.visible !== false
        );

        return (
          <div id="testimonials" className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-6 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
              <div>
                <h2 className="text-sm font-medium text-[var(--fg)] flex items-center gap-2 flex-wrap">
                  <span>Client Testimonials & Monograms</span>
                  <span className="font-mono text-[10px] bg-[var(--accent)]/15 text-[var(--accent-text)] px-2.5 py-0.5 rounded-full border border-[var(--accent)]/30 whitespace-nowrap shrink-0">
                    {publishedTestimonials.length} Published
                  </span>
                  {pendingTestimonials.length > 0 && (
                    <span className="font-mono text-[10px] bg-amber-400 text-black font-bold px-2.5 py-0.5 rounded-full shadow-sm animate-pulse whitespace-nowrap shrink-0">
                      {pendingTestimonials.length} Pending Approval
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-[var(--fg-muted)] font-mono mt-0.5">
                  Approve and manage client reviews. Approved reviews shine on the live home page with bold initials monograms.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddTestimonial((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--accent-text)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/30 px-3.5 py-2 rounded-lg transition-colors cursor-pointer w-fit whitespace-nowrap shrink-0"
                >
                  <span>{showAddTestimonial ? "✕ Close Form" : "+ Add Testimonial"}</span>
                </button>
              </div>
            </div>

            {/* Quick Share Link Banner */}
            <div className="bg-[var(--bg)] border border-white/10 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-sm">🔗</span>
                <div>
                  <span className="text-xs font-mono text-[var(--fg)] font-medium block">
                    Direct Client Review Link
                  </span>
                  <span className="text-[11px] font-mono text-[var(--fg-dim)] block">
                    Send to clients so they land directly on your site with the review pane open:
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const url = typeof window !== "undefined" ? `${window.location.origin}/#leaveareview` : "https://zetona.com/#leaveareview";
                  navigator.clipboard.writeText(url);
                  setTestimonialFeedback("Direct review link copied to clipboard!");
                  setTimeout(() => setTestimonialFeedback(""), 3500);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[var(--accent)] text-white hover:border-[var(--accent)] border border-white/10 text-xs font-mono transition-colors cursor-pointer shrink-0"
              >
                <span>/#leaveareview</span>
                <span className="text-[10px] text-white/60">📋 Copy Link</span>
              </button>
            </div>

            {testimonialFeedback && (
              <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs p-3 rounded-lg flex items-center gap-2">
                <span>✓</span>
                <span>{testimonialFeedback}</span>
              </div>
            )}

            {/* Pending Client Reviews Queue */}
            {pendingTestimonials.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                      Pending Reviews Awaiting Approval ({pendingTestimonials.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--fg-dim)]">
                    Submitted via /#leaveareview
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingTestimonials.map((t) => {
                    const initials = getInitials(t.author);
                    return (
                      <div
                        key={t.id}
                        className="bg-[var(--bg)] border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-[#252525] border border-amber-400/50 flex items-center justify-center font-serif text-sm font-bold text-amber-300 shadow flex-shrink-0">
                            {initials}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <h4 className="font-condensed uppercase text-sm font-bold text-[var(--fg)] tracking-wide">
                                {t.author}
                              </h4>
                              {(t.role || t.location) && (
                                <span className="text-[11px] font-sans text-amber-200/80">
                                  · {t.role} {t.location ? `(${t.location})` : ""}
                                </span>
                              )}
                              {t.rating && (
                                <span className="text-xs text-amber-400 font-mono tracking-tighter">
                                  {"★".repeat(t.rating)}
                                </span>
                              )}
                              {t.email && (
                                <span className="text-[10px] font-mono text-[var(--fg-dim)] bg-white/5 px-2 py-0.5 rounded">
                                  {t.email}
                                </span>
                              )}
                              {t.createdAt && (
                                <span className="text-[10px] font-mono text-[var(--fg-dim)]">
                                  {new Date(t.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <p className="font-serif italic text-xs text-[var(--fg)] mt-1.5 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
                              &ldquo;{t.quote}&rdquo;
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleApproveTestimonial(t.id, t.author)}
                            className="text-xs font-mono bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <span>✓</span>
                            <span>Approve & Publish</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(t)}
                            className="text-xs font-mono text-[var(--fg-dim)] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Edit ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTestimonial(t.id, t.author)}
                            className="text-xs font-mono text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Reject and delete review"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

            {/* Published Testimonials List */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-dim)]">
                Published Testimonials ({publishedTestimonials.length})
              </h3>
              {publishedTestimonials.map((t, idx) => {
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
                      {/* Monogram with Initials */}
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#242424] to-[#121212] border border-[var(--accent)]/40 flex items-center justify-center font-serif text-xs font-bold text-[var(--accent-text)] shadow flex-shrink-0">
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
                          {t.rating && (
                            <span className="text-xs text-amber-400 font-mono tracking-tighter">
                              {"★".repeat(t.rating)}
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
        );
      })()}

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

      {/* ──────────────── MODAL: PHOTO PICKER FOR AWARDS ──────────────── */}
      {selectingPhotoForAwardIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-elevated)] border border-[var(--line-strong)] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[var(--fg)]">
                  Choose Photo for &quot;{homeAwardsList[selectingPhotoForAwardIndex]?.title}&quot;
                </h3>
                <p className="text-[11px] font-mono text-[var(--fg-muted)]">
                  Click any photo below to assign it as the hover-reveal image
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectingPhotoForAwardIndex(null)}
                className="text-xs font-mono text-[var(--fg-muted)] hover:text-white px-2 py-1 rounded border border-white/10 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {photos.map((p) => {
                const isCurrent = homeAwardsList[selectingPhotoForAwardIndex]?.photoId === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => handleSetAwardPhoto(selectingPhotoForAwardIndex, p.id)}
                    className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isCurrent
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/50 scale-[0.98]"
                        : "border-transparent opacity-80 hover:opacity-100 hover:border-white/30"
                    }`}
                  >
                    <Image
                      src={getOptimizedSrc(p.displayKey, 300)}
                      alt={p.alt || p.title || "Photo"}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                    {isCurrent && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-[var(--accent)] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow">
                        ✓
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 text-[9px] text-white truncate text-left font-mono">
                      {p.title || "Untitled"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
