import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "font-bold",
    "line-through",
    "underline",
    "italic",
    "hover:underline",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsla(var(--background))",
        card: "var(--card)",
        black: "hsla(var(--black))",
        highlight: "hsla(var(--highlight))",
        primary: "hsla(var(--primary))",
        secondary: "hsla(var(--secondary))",
        muted: "hsla(var(--muted))",
        "text-3": "hsla(var(--text-3))",
        nav: "hsla(var(--nav))",
        "button-background": "hsla(var(--button-background))",
        error: "hsla(var(--error))",
        overlay: "hsla(var(--overlay))",
        "footer-background": "hsla(var(--footer-background))",
        "panel-background": "hsla(var(--panel-background))",
        "panel-background-2": "hsla(var(--panel-background-2))",
      },
      fontSize: {
        sm: ["1rem", "1.25rem"],
        md: ["1rem", "1.25rem"],
        xl: ["2rem", "2.5rem"],
      },
      fontWeight: {
        light: "300",
        regular: "500",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        // Short: each product cover fading in (see ProductCoversGrid). The
        // delay is part of the shorthand, read from --delay, so no separate
        // animation-delay rule can lose to it in the cascade.
        "fade-in-fast": "fade-in 50ms ease-out var(--delay, 0ms) both",
      },
    },
  },
};
