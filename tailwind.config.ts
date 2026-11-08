import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-raised": "var(--bg-raised)",
        "bg-elevated": "var(--bg-elevated)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        fg: "var(--fg)",
        "fg-muted": "var(--fg-muted)",
        "fg-dim": "var(--fg-dim)",
        accent: "var(--accent)",
        "accent-text": "var(--accent-text)",
        "accent-soft": "var(--accent-soft)",
        "accent-deep": "var(--accent-deep)",
        danger: "var(--danger)",
        success: "var(--success)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        condensed: ["var(--font-condensed)", "Anton", "Bebas Neue", "sans-serif"],
        heavy: ["'Archivo Black'", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "Inter Tight", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        mega: "var(--fs-mega)",
        hero: "var(--fs-hero)",
        h1: "var(--fs-h1)",
        h2: "var(--fs-h2)",
        h3: "var(--fs-h3)",
        lead: "var(--fs-lead)",
        body: "var(--fs-body)",
        small: "var(--fs-small)",
        micro: "var(--fs-micro)",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        wider: "0.06em",
        widest: "0.08em",
      },
      zIndex: {
        base: "0",
        content: "10",
        "sticky-header": "40",
        cursor: "60",
        menu: "70",
        lightbox: "80",
        toast: "90",
        transition: "100",
      },
    },
  },
  plugins: [],
};

export default config;
