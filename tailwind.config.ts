import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          900: "#312E81",
        },
        hero: {
          bg: "#17164B",
          dark: "#0F0E38",
          card: "#1E1B4B",
        },
        brand: {
          purple: "#6366F1",
          navy: "#17164B",
          light: "#F5F3FF",
        },
        status: {
          success: "#16A34A",
          successBg: "#ECFDF3",
          successBorder: "#BBF7D0",
          warning: "#D97706",
          warningBg: "#FFF7DB",
          warningBorder: "#FDE68A",
          warningOrange: "#EA580C",
        }
      },
      boxShadow: {
        'hero': '0 20px 40px -15px rgba(23, 22, 75, 0.25)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
export default config;
