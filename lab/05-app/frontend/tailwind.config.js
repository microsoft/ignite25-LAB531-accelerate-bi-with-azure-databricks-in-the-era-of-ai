/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#dddddd",
        input: "#dddddd",
        ring: "#ff5a5f",
        background: "#ffffff",
        foreground: "#222222",
        primary: {
          DEFAULT: "#ff5a5f",
          hover: "#e8484d",
          light: "#ffebec",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#00a699",
          hover: "#008489",
          light: "#e6f7f6",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#c13515",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f7f7f7",
          foreground: "#717171",
        },
        accent: {
          DEFAULT: "#f7f7f7",
          foreground: "#222222",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#222222",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#222222",
        },
        success: "#00a699",
        warning: "#ffb400",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        xl: "24px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      fontSize: {
        'hero': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '700' }],
        'subtitle': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.75rem', { fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      transitionProperty: {
        'default': 'color, background-color, border-color, transform, box-shadow',
      },
      transitionDuration: {
        'default': '200ms',
      },
      transitionTimingFunction: {
        'default': 'ease-in-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
