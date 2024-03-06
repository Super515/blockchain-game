module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        dark: {
          500: "#0B0713",
          600: "#130d20",
          700: "#1E192B",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
