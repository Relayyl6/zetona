"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CollectionDTO, mockCollections } from "@/lib/db/queries";
import { getOptimizedSrc } from "@/lib/storage/image-url";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionDTO[]>(mockCollections);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Editing state for an individual collection
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const loadCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/collections");
      if (res.ok) {
        const data = await res.json();
        if (data.collections) {
          setCollections(data.collections);
        }
      }
    } catch (err) {
      console.error("Failed to load collections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    setError("");

    try {
      const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug,
          description: newDesc.trim() || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create collection");
      }

      const data = await res.json();
      if (data.collection) {
        setCollections((prev) => [...prev, data.collection]);
      }

      setNewTitle("");
      setNewDesc("");
      setShowCreate(false);
      setFeedback("Collection created successfully!");
      setTimeout(() => setFeedback(""), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to create collection");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (col: CollectionDTO) => {
    setEditingId(col.id);
    setEditTitle(col.title);
    setEditSlug(col.slug);
    setEditDesc(col.description || "");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditSlug("");
    setEditDesc("");
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          slug: editSlug.trim() || editTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: editDesc.trim() || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update collection");
      }

      const data = await res.json();
      if (data.collection) {
        setCollections((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...data.collection } : c))
        );
      }

      setEditingId(null);
      setFeedback("Collection updated successfully!");
      setTimeout(() => setFeedback(""), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to update collection");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the collection "${title}"? Photos in this collection will become uncategorized.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete collection");
      }

      setCollections((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) setEditingId(null);
      setFeedback("Collection deleted successfully!");
      setTimeout(() => setFeedback(""), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to delete collection");
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-[var(--fg)] tracking-tight">Collections</h1>
          <p className="text-xs text-[var(--fg-muted)] font-mono mt-1">
            Manage your gallery collections and ordering
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-[var(--accent)] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[var(--accent-deep)] transition-colors cursor-pointer"
        >
          {showCreate ? "Cancel" : "+ New Collection"}
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs p-4 rounded-xl flex items-center justify-between">
          <span>✓ {feedback}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-500/40 text-red-300 text-xs p-4 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Create New Collection Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)] space-y-4">
          <h2 className="text-sm font-medium text-[var(--fg)]">Create New Collection</h2>
          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1">
              Title *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Editorial & Fashion"
              required
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Short intro for this collection"
              rows={2}
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="bg-[var(--accent)] text-white text-xs font-medium px-5 py-2.5 rounded-lg hover:bg-[var(--accent-deep)] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {creating && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>Create Collection</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-xs text-[var(--fg-muted)] hover:text-white px-3 py-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Collections list */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-[var(--fg-dim)] bg-[var(--bg-elevated)] rounded-xl border border-[var(--line)]">
            Loading collections...
          </div>
        ) : collections.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[var(--fg-dim)] bg-[var(--bg-elevated)] rounded-xl border border-[var(--line)]">
            No collections yet. Click &quot;+ New Collection&quot; above to create one.
          </div>
        ) : (
          collections.map((col, idx) => (
            <div
              key={col.id}
              className="bg-[var(--bg-elevated)] border border-[var(--line)] rounded-xl p-5 transition-all"
            >
              {editingId === col.id ? (
                /* INLINE EDIT MODE */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-text)]">
                      Editing Collection 0{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(col.id, col.title)}
                      className="text-xs text-red-400 hover:text-red-300 font-mono cursor-pointer"
                    >
                      Delete Collection ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        placeholder="e.g. portraits"
                        className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2 text-sm text-[var(--fg)] font-mono focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-wider block mb-1">
                      Description
                    </label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-2 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(col.id)}
                      disabled={saving}
                      className="bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white text-xs font-medium px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-xs text-[var(--fg-muted)] hover:text-white px-3 py-2 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <span className="font-mono text-xs text-[var(--fg-dim)]">0{idx + 1}</span>
                    <div className="w-16 h-20 relative overflow-hidden bg-[var(--bg)] rounded-md border border-[var(--line)] flex-shrink-0">
                      {col.coverPhoto ? (
                        <Image
                          src={getOptimizedSrc(col.coverPhoto.displayKey, 200)}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[var(--fg-dim)]">
                          No cover
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-base text-[var(--fg)]">{col.title}</h3>
                      <p className="text-xs text-[var(--fg-dim)] font-mono mt-0.5">/work/{col.slug}</p>
                      {col.description && (
                        <p className="text-xs text-[var(--fg-muted)] mt-1.5 max-w-md line-clamp-1">
                          {col.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-[var(--fg-muted)]">
                    <span>[{col.photoCount} photos]</span>
                    <button
                      onClick={() => startEdit(col)}
                      className="text-[var(--accent-text)] hover:underline cursor-pointer font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
