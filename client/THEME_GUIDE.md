# Theme & Tokens Guide

Short guide to keep UI theming consistent across the client.

## Where the single source of truth lives
- CSS tokens: `src/styles/design-tokens.css` — primary source of runtime values.
- Global import: `src/index.css` imports the tokens and establishes the app base.
- Tailwind: `tailwind.config.js` is configured to reference the CSS variables, so Tailwind utilities resolve at runtime.

## How to use tokens
- Use CSS variables (e.g. `var(--primary)`) directly in CSS when you need inline styles or custom rules.
- Prefer Tailwind utility classes mapped to tokens (e.g. `bg-surface`, `text-on-surface`, `shadow-ambient`) in markup.
- Use the shared UI primitives in `src/components/ui` (`Button`, `Card`, `GlassContainer`) for consistent visuals.

**Background classes**
| Tailwind class | Token | Current color |
|---|---|---|
| `bg-surface` | `--surface` | `#151316` |
| `bg-surface-container-low` | `--surface-container-low` | `#1b191d` |
| `bg-surface-container` | `--surface-container` | `#201e23` |
| `bg-surface-container-high` | `--surface-container-high` | `#26242a` |
| `bg-surface-container-highest` | `--surface-container-highest` | `#2c2930` |
| `bg-surface-variant` | `--surface-variant` | `#252228` |
| `bg-surface-bright` | `--surface-bright` | `#2f2c34` |
| `bg-primary` | `--primary` | `#56f7b7` |
| `bg-primary-container` | `--primary-container` | `#2cda9d` |
| `bg-secondary` | `--secondary` | `#8ad3d3` |
| `bg-secondary-container` | `--secondary-container` | `#005f5f` |
| `bg-tertiary` | `--tertiary` | `#2cfe4c` |

**Text classes**
| Tailwind class | Token | Current color |
|---|---|---|
| `text-on-surface` | `--on-surface` | `#e7e1e5` |
| `text-on-primary` | `--on-primary` | `#0b0b0b` |
| `text-primary` | `--primary` | `#56f7b7` |
| `text-secondary` | `--secondary` | `#8ad3d3` |
| `text-tertiary` | `--tertiary` | `#2cfe4c` |

**Shadow**
| Tailwind class | Token | Current value |
|---|---|---|
| `shadow-ambient` | `--ambient-shadow` | `0px 24px 48px rgba(0, 0, 0, 0.4)` |

**Copy‑paste example**
```jsx
<button className="bg-primary text-on-primary px-4 py-2 rounded-md shadow-ambient">
  Primary
</button>
```

## Forbidden patterns
- Do NOT add hard-coded hex colors inside `src/` files. Use tokens instead.
- Avoid inline style hex colors (e.g. `style={{ color: '#56f7b7' }}`) — use classes or CSS variables.

## If you need to add or change tokens
1. Update `src/styles/design-tokens.css` with the new variable.
2. If you need a new Tailwind-friendly token name, add the corresponding `--variable` to the tokens file and reference it in `tailwind.config.js` (prefer `var(--...)`).
3. Update `THEME_GUIDE.md` and relevant components demonstrating usage.

# Questions or exceptions
- If you believe an exception is needed (rare), open a short PR and explain the accessibility and visual rationale in the description.

This guide is intentionally short — keep it updated as the design system evolves.
