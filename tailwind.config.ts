import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0A0D14",
          surface: "#121826",
          surfaceElevated: "#1A2234",
          surfaceBorder: "#243048",
          gold: "#FFC700",
          goldHover: "#E5B200",
          blue: "#1D52B8",
          blueLight: "#3B82F6",
          blueDark: "#113274",
          red: "#E51D2A",
          redDark: "#B8141F",
        },
      },
      aspectRatio: {
        dvd: "2 / 3",
        banner: "16 / 9",
      },
      boxShadow: {
        dvd: "0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)",
        dvdHover: "0 20px 30px -10px rgba(29, 82, 184, 0.35), 0 10px 15px -5px rgba(255, 199, 0, 0.2)",
        glowGold: "0 0 20px rgba(255, 199, 0, 0.35)",
        glowBlue: "0 0 20px rgba(29, 82, 184, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
