"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { mockPhotos, mockCollections, PhotoDTO } from "@/lib/db/queries";
import { UploadDropzone } from "@/components/admin/UploadDropzone";

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<PhotoDTO[]>(mockPhotos);
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft" | "trashed">("all");
  const [filterCollection, setFilterCollection] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // Load live photos on mount
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch("/api/admin/photos");
        if (res.ok) {
          const data = await res.json();
          if (data.photos && Array.isArray(data.photos)) {
            setPhotos(data.photos);
          }
        }
      } catch (err) {
        console.error("Failed to load photos:", err);
      }
    }
    fetchPhotos();
  }, []);

  const filteredPhotos = photos.filter((p) => {
    if (filterStatus !== "all") {
      const status = p.featuredHome ? "published" : "draft";
      if (filterStatus === "published" && !p.featuredHome) return false;
      if (filterStatus === "draft" && p.featuredHome) return false;
    }
    if (filterCollection !== "all" && p.collection?.slug !== filterCollection) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchAlt = p.alt?.toLowerCase().includes(q);
      if (!matchTitle && !matchAlt) return false;
    }
    return true;
  });

  const handleFilesSelected = async (files: File[]) => {
    setUploading(true);
    setUploadStatus(`Uploading ${files.length} photo(s) directly to Cloudinary...`);

    const uploadedPhotos: PhotoDTO[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadStatus(`Uploading ${i + 1}/${files.length}: ${file.name}...`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""));
      formData.append("alt", `Portrait session photography by Zetona_E - ${file.name}`);
      formData.append("featuredHome", "true");

      try {
        const res = await fetch("/api/admin/uploads/cloudinary", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.photo) {
            uploadedPhotos.push(data.photo);
          }
        }
      } catch (err) {
        console.error("Upload error for file", file.name, err);
      }
    }

    if (uploadedPhotos.length > 0) {
      setPhotos((prev) => [...uploadedPhotos, ...prev]);
      setUploadStatus(`Successfully uploaded and saved ${uploadedPhotos.length} photo(s) to Cloudinary!`);
    } else {
      setUploadStatus("Upload failed. Please check your network connection.");
    }

    setUploading(false);
    setTimeout(() => {
      setShowUpload(false);
      setUploadStatus("");
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[var(--fg)] tracking-tight">Photos</h1>
          <p className="text-xs text-[var(--fg-muted)] font-mono mt-1">
            {photos.length} total photos stored · Cloudinary Media Storage
          </p>
        </div>

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-[var(--accent)] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[var(--accent-deep)] transition-colors self-start sm:self-auto cursor-pointer"
        >
          {showUpload ? "Hide Upload" : "+ Add Photos to Cloudinary"}
        </button>
      </div>

      {uploadStatus && (
        <div className="bg-[#2B59FF]/15 border border-[#2B59FF]/30 text-[#F6F2E6] text-xs p-4 rounded-xl flex items-center gap-2">
          {uploading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      {showUpload && (
        <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--line)]">
          <UploadDropzone onFilesSelected={handleFilesSelected} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--line)] text-xs font-medium w-fit">
          {(["all", "published", "draft", "trashed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                filterStatus === status
                  ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Collection Filter */}
          <select
            value={filterCollection}
            onChange={(e) => setFilterCollection(e.target.value)}
            className="bg-[var(--bg-elevated)] border border-[var(--line)] text-xs text-[var(--fg)] px-3 py-2 rounded-lg focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="all">All Collections</option>
            {mockCollections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Search input */}
          <input
            type="text"
            placeholder="Search photos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[var(--bg-elevated)] border border-[var(--line)] text-xs text-[var(--fg)] px-3 py-2 rounded-lg focus:outline-none focus:border-[var(--accent)] w-48 sm:w-64"
          />
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group relative bg-[var(--bg-elevated)] border border-[var(--line)] rounded-lg overflow-hidden hover:border-[var(--line-strong)] transition-all flex flex-col"
          >
            <div className="aspect-[3/4] relative bg-black/40 overflow-hidden">
              <Image
                src={photo.displayKey}
                alt={photo.alt || "Portfolio photo"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(min-width:1024px) 20vw, 33vw"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                {photo.featuredHome && (
                  <span className="bg-black/60 backdrop-blur-sm text-[10px] font-mono px-1.5 py-0.5 rounded text-[var(--accent-text)] border border-white/10">
                    Home
                  </span>
                )}
                {photo.featuredAbout && (
                  <span className="bg-black/60 backdrop-blur-sm text-[10px] font-mono px-1.5 py-0.5 rounded text-white/80 border border-white/10">
                    About
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--fg)] truncate">
                  {photo.title || "Untitled"}
                </p>
                <p className="text-[10px] text-[var(--fg-muted)] font-mono truncate mt-0.5">
                  {photo.collection?.title || "Uncategorized"}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
                <span className="font-mono text-[var(--fg-dim)]">
                  {photo.width}×{photo.height}
                </span>
                <Link
                  href={`/admin/photos/${photo.id}`}
                  className="text-[var(--accent-text)] hover:underline font-mono"
                >
                  Edit →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
