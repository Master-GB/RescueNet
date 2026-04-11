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
        danger: "var(--danger)",
        warning: "var(--warning)",
        success: "var(--success)",

        "auth-bg": "var(--auth-bg)",
        "auth-surface": "var(--auth-surface)",
        "auth-surface-glass": "var(--auth-surface-glass)",
        "auth-surface-glass-border": "var(--auth-surface-glass-border)",
        "auth-border": "var(--auth-border)",
        "auth-border-subtle": "var(--auth-border-subtle)",
        "auth-text": "var(--auth-text)",
        "auth-text-strong": "var(--auth-text-strong)",
        "auth-text-soft": "var(--auth-text-soft)",
        "auth-text-muted": "var(--auth-text-muted)",
        "auth-placeholder": "var(--auth-placeholder)",
        "auth-success-bg": "var(--auth-success-bg)",
        "auth-success-border": "var(--auth-success-border)",
        "auth-warning-bg": "var(--auth-warning-bg)",
        "auth-warning-border": "var(--auth-warning-border)",
        "auth-danger-bg": "var(--auth-danger-bg)",
        "auth-danger-border": "var(--auth-danger-border)",
      },
      boxShadow: {
        ambient: "var(--ambient-shadow)",
        "auth-shell-panel": "var(--auth-shell-panel-shadow)",
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 1s ease-in-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}