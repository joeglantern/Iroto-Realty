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
        brown: '#713900',
        primary: '#713900',
        secondary: '#0C0C0C',
      },
      fontFamily: {
        sans: ['Andika', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;