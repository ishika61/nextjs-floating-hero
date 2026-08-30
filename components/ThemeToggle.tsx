"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Standalone dark-mode toggle. Purely additive: it only ever adds/removes
 * a `dark` class on <html>, so it never touches any existing markup,
 * layout, or class on the rest of the page — every other component just
 * reacts to that class via its own `dark:` utility variants.
 *
 * On first mount it respects the user's saved choice (localStorage), and
 * falls back to the OS-level `prefers-color-scheme` when nothing was
 * saved yet.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored ? stored === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", shouldBeDark);
    setIsDark(shouldBeDark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={`group inline-flex h-10 w-10 items-center justify-center rounded-full border border-headline/20 bg-white/70 text-headlineStrong shadow-sm backdrop-blur transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-headlineStrongDark sm:h-11 sm:w-11 ${
        mounted ? "animate-fadeIn" : "opacity-0"
      } ${className}`}
    >
      {isDark ? (
        <Sun size={18} strokeWidth={2.25} className="animate-popIn" />
      ) : (
        <Moon size={18} strokeWidth={2.25} className="animate-popIn" />
      )}
    </button>
  );
}
