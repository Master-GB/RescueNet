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
        surface: "#151316",
        "surface-container-low": "#1b191d",
        "surface-container": "#201e23",
        "surface-container-high": "#26242a",
        "surface-container-highest": "#2c2930",
        "surface-variant": "#252228",
        "surface-bright": "#2f2c34",
        "on-surface": "#e7e1e5",
        primary: "#56f7b7",
        "primary-container": "#2cda9d",
        secondary: "#8ad3d3",
        "secondary-container": "#005f5f",
        tertiary: "#2cfe4c",
        "on-primary": "#0b0b0b",
      },
      boxShadow: {
        ambient: "0px 24px 48px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
}