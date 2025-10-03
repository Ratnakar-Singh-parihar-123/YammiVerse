/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--color-popover)",
          foreground: "var(--color-popover-foreground)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
        success: { DEFAULT: "var(--color-success)", foreground: "var(--color-success-foreground)" },
        warning: { DEFAULT: "var(--color-warning)", foreground: "var(--color-warning-foreground)" },
        error: { DEFAULT: "var(--color-error)", foreground: "var(--color-error-foreground)" },
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
        caption: ["Source Sans Pro", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        warm: "0 2px 8px rgba(139,69,19,.08)",
        "warm-md": "0 4px 12px rgba(139,69,19,.12)",
        "warm-lg": "0 8px 24px rgba(139,69,19,.16)",
      },
      borderRadius: { lg: "8px", md: "6px", sm: "4px" },
      spacing: { 18: "4.5rem", 88: "22rem" },
      minHeight: { touch: "44px" },
      minWidth: { touch: "44px" },
      animation: { "pulse-subtle": "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" },
      transitionDuration: { 150: "150ms", 200: "200ms", 300: "300ms" },
      transitionTimingFunction: { "ease-out": "ease-out", "ease-in-out": "ease-in-out", linear: "linear" },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
};
