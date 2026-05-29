/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        vt: ['"VT323"', "monospace"],
        tech: ['"Share Tech Mono"', "monospace"],
        orbit: ['"Orbitron"', "sans-serif"],
        chakra: ['"Chakra Petch"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
