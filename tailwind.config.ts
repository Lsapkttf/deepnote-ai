
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    fontFamily: {
      futuristic: ["'Orbitron'", "sans-serif"],
      body: ["'Roboto'", "Arial", "sans-serif"],
    },
    extend: {
      colors: {
        background: "#181A20",
        foreground: "#F5F7FB",
        accent: {
          DEFAULT: "#27F7FF",
          500: "#1BC6CF",
          neon: "#00E5FF"
        },
        primary: {
          DEFAULT: "#C084FC",
          500: "#8B5CF6"
        },
        secondary: {
          DEFAULT: "#19C37D"
        },
        card: "#232433",
        glass: "rgba(36,41,57,0.85)"
      },
      borderRadius: {
        xl: "2rem",
        lg: "1rem",
        md: "0.75rem",
      },
      boxShadow: {
        futuristic: "0 2px 24px 8px rgba(39,247,255,0.08), 0 0 18px 0px #27f7ff60",
        neon: "0 0 14px #00E5FF, 0 0 24px #8B5CF6",
        card: "0 1.5px 8px #27f7ff30, 0 0 0.5em #19C37D33"
      },
      backgroundImage: {
        'futuristic': 'linear-gradient(135deg, #1A2236 0%, #4F5E8E 60%, #261e5b 100%)',
        'futuristic-lines': "repeating-linear-gradient(45deg, #19C37D11 0 2px, transparent 2px 50px)",
        'neon-gradient': 'linear-gradient(90deg,#27F7FF 0%, #8B5CF6 80%)'
      },
      keyframes: {
        'neon-blink': {
          "0%,100%":{opacity:1,"box-shadow":"0 0 6px #27f7ff, 0 0 24px #8B5CF6"},
          "60%":{opacity:0.7,"box-shadow":"0 0 24px #27f7ff, 0 0 48px #00E5FF"},
        }
      },
      animation: {
        'neon-blink': 'neon-blink 1.8s alternate infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
