/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EDE6D6",
        paperWarm: "#E4DBC5",
        ink: "#211D18",
        inkSoft: "#524A3D",
        moss: "#55643E",
        ochre: "#B4832A",
        brick: "#7A3B2E",
        slate: "#3C4A52",
        line: "#CBBFA0",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Source Serif 4'", "serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
