import type { Config } from "tailwindcss";

const config: Config = {
  // Added: enables toggleable dark mode via a `.dark` class on <html>,
  // additive only — does not affect any existing light-mode class.
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#EEF2FA",
        blob: "#DCE5F7",
        headline: "#828CAE",
        headlineStrong: "#5D6690",
        body: "#4453E8",
        billing: "#3241F2",
        matters: "#E27C34",
        dark: "#211E3B",
        portal: "#B9C0F2",
        portalText: "#221F3D",
        // --- Added: dark-theme counterparts, used only via `dark:` variants ---
        canvasDark: "#080B16",
        blobDark: "#161B33",
        headlineDark: "#9AA3C7",
        headlineStrongDark: "#F1F3FC",
        bodyDark: "#B7C0FF",
        portalDark: "#232748",
        portalTextDark: "#E9ECFB",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blobFloat: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-10px) scale(1.02)" },
        },
        // --- Added: subtle idle-floating + fade/pop utilities ---
        gentleFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        blobFloat: "blobFloat 9s ease-in-out infinite",
        // --- Added ---
        gentleFloat: "gentleFloat 5s ease-in-out infinite",
        fadeIn: "fadeIn 0.5s ease-out both",
        popIn: "popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
