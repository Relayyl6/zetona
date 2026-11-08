"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6 text-center"
    >
      <h1
        className="font-condensed uppercase text-[var(--fg)] mb-4"
        style={{ fontSize: "var(--fs-h2)" }}
      >
        Something went wrong
      </h1>
      <p className="text-[var(--fg-muted)] font-sans text-base mb-8 max-w-md">
        An unexpected error occurred while loading this page. You can try refreshing or contact me directly.
      </p>
      {error?.message && (
        <div className="mb-8 p-4 bg-red-950/40 border border-red-500/30 rounded text-red-200 text-xs font-mono max-w-2xl text-left overflow-auto">
          <p className="font-bold text-red-400 mb-1">Error: {error.message}</p>
          {error.digest && <p className="text-gray-400">Digest: {error.digest}</p>}
          {error.stack && <pre className="whitespace-pre-wrap mt-2 text-[10px] text-gray-300">{error.stack}</pre>}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="border border-[var(--line-strong)] text-[var(--fg)] text-sm font-sans px-6 py-2.5 rounded-full hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all duration-300"
        >
          Try again
        </button>
        <a
          href={buildWhatsAppUrl("Hello Zetona_E, I experienced an issue on your website.")}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[var(--accent)] text-white text-sm font-sans px-6 py-2.5 rounded-full hover:bg-[var(--accent-deep)] transition-colors"
        >
          Contact on WhatsApp ↗
        </a>
        <Link
          href="/"
          className="text-[var(--fg-muted)] hover:text-[var(--fg)] text-sm font-sans underline"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
