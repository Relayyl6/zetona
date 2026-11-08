import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6 text-center"
    >
      <Reveal>
        <h1
          className="font-condensed uppercase text-[var(--fg)] leading-none mb-6"
          style={{ fontSize: "var(--fs-mega)" }}
        >
          404
        </h1>
      </Reveal>
      <Reveal delay={0.15}>
        <p className="text-[var(--fg-muted)] font-sans text-base mb-10">
          This page doesn&apos;t exist — but the work does.
        </p>
      </Reveal>
      <Reveal delay={0.25}>
        <Link
          href="/work"
          className="inline-flex items-center gap-2 border border-[var(--line-strong)] text-[var(--fg)] text-sm font-sans px-6 py-3 rounded-full hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all duration-300"
        >
          Back to work →
        </Link>
      </Reveal>
    </main>
  );
}
