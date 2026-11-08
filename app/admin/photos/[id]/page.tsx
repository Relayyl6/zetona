"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { mockPhotos, mockCollections, PhotoDTO } from "@/lib/db/queries";
import { FocalPointPicker } from "@/components/admin/FocalPointPicker";

export default function EditPhotoPage() {
  const params = useParams();
  const router = useRouter();
  const photoId = params?.id as string;

  const [photo, setPhoto] = useState<PhotoDTO>(
    mockPhotos.find((p) => p.id === photoId) || mockPhotos[0]
  );

  const [title, setTitle] = useState(photo.title || "");
  const [alt, setAlt] = useState(photo.alt || "");
  const [caption, setCaption] = useState(photo.caption || "");
  const [collectionId, setCollectionId] = useState(photo.collection?.id || "");
  const [focal, setFocal] = useState(photo.focal || { x: 0.5, y: 0.35 });
  const [featuredHome, setFeaturedHome] = useState(photo.featuredHome ?? false);
  const [featuredAbout, setFeaturedAbout] = useState(photo.featuredAbout ?? false);
  const [status, setStatus] = useState<"draft" | "published" | "trashed">(
    photo.featuredHome ? "published" : "draft"
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load live photo data from API
  useEffect(() => {
    async function loadPhoto() {
      try {
        const res = await fetch(`/api/admin/photos/${photoId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.photo) {
            setPhoto(data.photo);
            setTitle(data.photo.title || "");
            setAlt(data.photo.alt || "");
            setCaption(data.photo.caption || "");
            setCollectionId(data.photo.collection?.id || "");
            setFocal(data.photo.focal || { x: 0.5, y: 0.35 });
            setFeaturedHome(Boolean(data.photo.featuredHome));
            setFeaturedAbout(Boolean(data.photo.featuredAbout));
          }
        }
      } catch (err) {
        console.error("Failed to load photo:", err);
      }
    }
    loadPhoto();
  }, [photoId]);

  const handleSave = async () => {
    // Invariant 1: Published photo requires alt >= 8 chars
    if (status === "published" && (!alt || alt.trim().length < 8)) {
      setError("Alt text is required to publish (minimum 8 characters describing the photo).");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          alt,
          caption,
          focalX: focal.x,
          focalY: focal.y,
          featuredHome,
          featuredAbout,
          status,
          collectionId: collectionId || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save photo changes");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save photo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this photo?")) return;

    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      alert("Failed to delete photo");
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, alt, title, caption, focal, featuredHome, featuredAbout]);

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="text-xs font-mono text-[var(--accent-text)] hover:underline mb-2 block"
          >
            ← Back to Photos
          </Link>
          <h1 className="text-2xl font-serif text-[var(--fg)] tracking-tight">
            Edit Photo
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="border border-[var(--danger)] text-[var(--danger)] text-xs font-medium px-4 py-2 rounded-lg hover:bg-[var(--danger)]/10 transition-colors cursor-pointer"
          >
            Delete to Trash
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--accent)] text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-[var(--accent-deep)] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>{saved ? "Saved to Site ✓" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs p-3.5 rounded-lg">
          ✓ Photo updated successfully and live on portfolio!
        </div>
      )}

      {error && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] text-xs p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Focal Point Picker */}
        <div className="md:col-span-5 bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)]">
          <FocalPointPicker
            imageUrl={photo.displayKey}
            focalX={focal.x}
            focalY={focal.y}
            onChange={setFocal}
          />
        </div>

        {/* Right Column: Fields */}
        <div className="md:col-span-7 bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-6">
          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-2">
              Collection / Section
            </label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              <option value="col_portraits_01">Portraits</option>
              <option value="col_studio_02">Studio Sessions</option>
              <option value="col_editorial_03">Editorial & Mood</option>
            </select>
            <p className="text-[11px] text-[var(--fg-dim)] font-mono mt-1">
              Choose which of the 3 main public sections this photograph belongs to
            </p>
          </div>

          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-2">
              Alt Text <span className="text-[var(--danger)]">* Required</span>
            </label>
            <textarea
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              rows={3}
              placeholder="Descriptive text for accessibility & image SEO..."
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] resize-none"
            />
            <p className="text-[11px] text-[var(--fg-dim)] font-mono mt-1">
              Minimum 8 characters. Currently: {alt.length} chars
            </p>
          </div>

          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-2">
              Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="pt-2 border-t border-[var(--line)] space-y-4">
            <h3 className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider">
              Display Placement
            </h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featuredHome}
                onChange={(e) => setFeaturedHome(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--fg)]">Featured on Home (Collage Hero Slot)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featuredAbout}
                onChange={(e) => setFeaturedAbout(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--fg)]">Featured on About Page</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
