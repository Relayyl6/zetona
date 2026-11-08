/**
 * Design tokens mirrored for JavaScript / Motion usage.
 * Authoritative CSS variables live in app/globals.css.
 * Source: docs/DESIGN.md §3
 */
export const colors = {
  bg: "#0A0A0A",
  bgRaised: "#161616",
  bgElevated: "#1F1F1F",
  line: "rgba(246,242,230,0.14)",
  lineStrong: "rgba(246,242,230,0.32)",
  fg: "#F6F2E6",
  fgMuted: "rgba(246,242,230,0.62)",
  fgDim: "rgba(246,242,230,0.34)",
  accent: "#2B59FF", // Cobalt [SUGGESTED]
  accentText: "#7B97FF",
  accentSoft: "rgba(43,89,255,0.16)",
  accentDeep: "#1237C9",
  danger: "#FF5D5D",
  success: "#4FD18B",
} as const;

export const zIndex = {
  base: 0,
  content: 10,
  stickyHeader: 40,
  cursor: 60,
  menu: 70,
  lightbox: 80,
  toast: 90,
  transition: 100,
} as const;
