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

### Example usage (using tailwind classes referencing tokens):

```jsx
<button className="bg-primary text-on-primary px-4 py-2 rounded-md shadow-ambient transition hover:opacity-95">
  Primary action
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
