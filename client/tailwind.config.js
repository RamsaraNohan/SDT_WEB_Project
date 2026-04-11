/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(222, 47%, 11%)",
        foreground: "hsl(210, 40%, 98%)",
        primary: {
          DEFAULT: "hsl(217, 91%, 60%)",
          foreground: "hsl(222, 47%, 11%)",
        },
        secondary: {
          DEFAULT: "hsl(217, 19%, 27%)",
          foreground: "hsl(210, 40%, 98%)",
        },
        accent: {
          DEFAULT: "hsl(217, 91%, 60%)",
          foreground: "hsl(210, 40%, 98%)",
        },
        card: {
          DEFAULT: "hsl(222, 47%, 15%)",
          foreground: "hsl(210, 40%, 98%)",
        },
        muted: {
          DEFAULT: "hsl(217, 19%, 20%)",
          foreground: "hsl(215, 20%, 65%)",
        }
      },
      borderRadius: {
        xl: "1rem",
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      animation: {
        "reveal-fade": "reveal-fade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "reveal-fade": {
          "0%": { opacity: "0", filter: "blur(10px)", transform: "scale(0.95) translateY(10px)" },
          "100%": { opacity: "1", filter: "blur(0)", transform: "scale(1) translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shimmer": {
          "from": { "backgroundPosition": "0 0" },
          "to": { "backgroundPosition": "-200% 0" }
        }
      }
    },
  },
  plugins: [],
}
