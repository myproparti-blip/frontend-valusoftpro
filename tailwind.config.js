/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Premium Color Palette
        neutral: {
          0: "#ffffff",
          50: "#f9f9fa",
          100: "#f5f7fa",
          150: "#f0f3f8",
          200: "#e8ecef",
          300: "#e0e0e0",
          400: "#c0c8d8",
          500: "#9b9b9b",
          600: "#4f4f4f",
          700: "#2a2a2a",
          800: "#1a1a1a",
          900: "#0f0f0f",
          950: "#05050a",
        },
        // Premium Brand Colors
        blue: {
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#bae3ff",
          300: "#7cc5ff",
          400: "#4a90e2",
          500: "#357abd",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        violet: {
          50: "#f9f5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#6c63ff",
          500: "#6d28d9",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "3xl": "1.875rem",
      },
      boxShadow: {
        "premium-xs": "0 1px 2px rgba(0, 0, 0, 0.05)",
        "premium-sm": "0 2px 4px rgba(0, 0, 0, 0.08)",
        "premium-md": "0 4px 8px rgba(0, 0, 0, 0.1)",
        "premium-lg": "0 8px 16px rgba(0, 0, 0, 0.12)",
        "premium-xl": "0 12px 24px rgba(0, 0, 0, 0.15)",
        "premium-2xl": "0 20px 40px rgba(0, 0, 0, 0.18)",
        "enterprise-sm": "0 1px 3px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        "enterprise-md": "0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
