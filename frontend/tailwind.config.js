/** @type {import('tailwindcss').Config} */
import formsPlugin from "@tailwindcss/forms";
import headlessPlugin from "@headlessui/tailwindcss";
import tailwind from "tailwindcss/defaultConfig";

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    ...tailwind.theme,
    extend: {
      container: {
        center: true,
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ['"Josefin Sans"', "sans-serif"],
      },
    },
  },
  plugins: [formsPlugin, headlessPlugin],
};
