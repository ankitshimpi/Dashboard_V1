import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        appBg: "#f8fafc",
        cardBg: "#ffffff",
        border: "#dbe2ef",
        primary: {
          DEFAULT: "#1a56db",
          hover: "#1e429f",
        },
        textMain: "#0f172a",
        textDim: "#6b7280",
      },
      borderRadius: {
        card: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
