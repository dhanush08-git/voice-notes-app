/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  safelist: [
    "translate-x-0",
    "-translate-x-full",
    "backdrop-blur-sm",
  ],
  theme: { extend: {} },
  plugins: [],
};