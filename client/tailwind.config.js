module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Raleway", "ui-sans-serif", "system-ui"],
      },
      colors: {
        surface: "var(--surface)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "surface-variant": "var(--surface-variant)",
        "surface-bright": "var(--surface-bright)",
        "on-surface": "var(--on-surface)",
        primary: "var(--primary)",
        "primary-container": "var(--primary-container)",
        secondary: "var(--secondary)",
        "secondary-container": "var(--secondary-container)",
        tertiary: "var(--tertiary)",
        "on-primary": "var(--on-primary)",
      },
      boxShadow: {
        ambient: "var(--ambient-shadow)",
      },
    },
  },
  plugins: [],
}