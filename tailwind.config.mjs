/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: {
        lg: {
          css: {
            h2: {
              "font-weight": 500,
              "font-size": "18px",
            },
            a: {
              "text-decoration": "underline",
            },
            ol: {
              "list-style-type": "decimal",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
