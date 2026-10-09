import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palet Soilmate: utama #172F2C, kedua #629560, ketiga #3DA35D, putih #FAFAFA
        white: "#FAFAFA",
        forest: { DEFAULT: "#629560", light: "#3DA35D", dark: "#172F2C" },
        moss: "#3DA35D",
        cream: { DEFAULT: "#F7F3E3", light: "#FBF9F0" },
        sand: "#F1EAC0",
        clay: "#E08A6B",
        alert: "#B5342A",
      rank1: "#8FBC8F",
rank2: "#B5CC7A",
rank3: "#E8D97A",
rank4: "#F0B37E",
rank5: "#E89999",
        // Warna baru versi mobile-first
        header: "#172F2C",
        footer: "#DBD698",
        loadingCard: "#172F2C",
        kondisiCard: "#629560", // pita judul kartu
        tile: "#3DA35D", // kotak angka di dalam kartu
        ringkasanCard: "#DCEFE2",
      },
     fontFamily: {
  display: ["var(--font-lexend)", "sans-serif"],
  body: ["var(--font-lexend)", "sans-serif"],
  lexend: ["var(--font-lexend)", "sans-serif"],
},
      borderRadius: { "2xl": "1.25rem", "3xl": "1.75rem" },
    },
  },
  plugins: [],
};
export default config;