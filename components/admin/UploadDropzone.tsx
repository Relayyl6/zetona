"use client";

import React, { useState, useRef } from "react";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
}

export function UploadDropzone({
  onFilesSelected,
  isUploading = false,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
      e.target.value = "";
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragOver
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--line-strong)] hover:border-[var(--fg)] bg-[var(--bg-elevated)]"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFileInput}
        className="hidden"
        disabled={isUploading}
      />

      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--accent)] text-xl border border-[var(--line)]">
          ↑
        </div>
        <div>
          <p className="font-sans font-medium text-sm text-[var(--fg)]">
            {isUploading ? "Uploading photos..." : "Tap or drag photos to upload"}
          </p>
          <p className="font-sans text-xs text-[var(--fg-dim)] mt-1">
            JPEG, PNG, WebP up to 40 MB. Camera roll supported.
          </p>
        </div>
      </div>
    </div>
  );
}
