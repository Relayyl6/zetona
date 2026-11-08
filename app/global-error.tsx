"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en-NG">
      <body style={{ backgroundColor: "#0A0A0A", color: "#F6F2E6", margin: 0, fontFamily: "sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem", textTransform: "uppercase", marginBottom: "1rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "rgba(246, 242, 230, 0.7)", maxWidth: "28rem", marginBottom: "2rem", lineHeight: 1.6 }}>
            An unexpected error occurred. Please refresh the page or return to the home screen.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#2B59FF",
                color: "#ffffff",
                border: "none",
                padding: "0.75rem 1.75rem",
                borderRadius: "9999px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                border: "1px solid rgba(246, 242, 230, 0.3)",
                color: "#F6F2E6",
                padding: "0.75rem 1.75rem",
                borderRadius: "9999px",
                textDecoration: "none",
              }}
            >
              Back Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
