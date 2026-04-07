# Design System Specification: The Vigilant Sanctuary

## 1. Overview & Creative North Star
In an emergency context, clarity is more than an aesthetic—it is a functional necessity. This design system departs from the cluttered, "utility-first" look of traditional emergency apps to embrace a philosophy we call **"The Vigilant Sanctuary."** 

The Creative North Star focuses on **Atmospheric Clarity**. By utilizing deep, obsidian-toned surfaces and high-frequency "signal" colors, we create a UI that feels both protective and authoritative. We break the rigid, boxy "template" feel through intentional asymmetry, overlapping "glass" containers, and an editorial typographic scale that guides the eye under high-stress conditions. This system is designed to reduce cognitive load by treating every pixel as a quiet, steady hand in the dark.

---

## 2. Colors
Our palette is a study in high-contrast luminescence. We use a dark substrate to allow our primary "action" colors to vibrate with urgency and intent.

*   **Surface Foundation:** The background (`#151316`) serves as our canvas. We do not use pure black, allowing for a softer, more premium depth.
*   **The Signal (Primary):** `primary` (`#56f7b7`) and `primary_container` (`#2cda9d`) are reserved for critical path actions—finding a shelter or calling for help.
*   **The Anchor (Secondary):** `secondary` (`#8ad3d3`) and `secondary_container` (`#005f5f`) handle navigation and structural elements, providing a calming, oceanic counterpoint to the vibrant mint signals.
*   **The Alert (Tertiary):** `tertiary` (`#2cfe4c`) is used exclusively for success states and "Shelter Available" indicators.

### Auth Light Palette (Tokenized Exception)
Authentication screens intentionally use a light shell while preserving the Vigilant Sanctuary brand accents. These values are fixed and must be consumed through tokens only.

*   `auth_bg` = `#f8fafc`
*   `auth_surface` = `#ffffff`
*   `auth_border` = `#e2e8f0`
*   `auth_border_subtle` = `#f1f5f9`
*   `auth_text` = `#0f172a`
*   `auth_text_strong` = `#1e293b`
*   `auth_text_soft` = `#475569`
*   `auth_text_muted` = `#64748b`
*   `auth_placeholder` = `#94a3b8`
*   `auth_success_bg` = `#f0fdf4`
*   `auth_success_border` = `#bbf7d0`
*   `auth_warning_bg` = `#fefce8`
*   `auth_warning_border` = `#fef08a`
*   `auth_danger_bg` = `#fef2f2`
*   `auth_danger_border` = `#fecaca`

Rule: do not use default Tailwind palette classes (`slate-*`, `red-*`, `yellow-*`, `green-*`) in auth feature code when an auth token class exists.

### The "No-Line" Rule
Standard UI relies on 1px borders to separate content. **In this design system, 1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through:
1.  **Background Color Shifts:** A `surface-container-low` section sitting on a `surface` background.
2.  **Tonal Transitions:** Using the hierarchy of `surface-container` tokens to create natural edges.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
*   **Level 0 (Base):** `surface`
*   **Level 1 (Sections):** `surface-container-low`
*   **Level 2 (Cards):** `surface-container-high`
*   **Level 3 (Modals/Pop-overs):1** `surface-container-highest`
This nesting creates "soft depth" that feels architectural rather than "pasted on."

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for floating elements (like a map search bar). Apply a semi-transparent `surface_variant` with a 20px backdrop blur. For main CTAs, use a subtle linear gradient transitioning from `primary` to `primary_container` at a 135-degree angle to give the button "soul" and a tactile, backlit quality.

---

## 3. Typography
We utilize **Raleway** across the entire system. Its elegant, geometric construction provides the high-end editorial feel required for a premium experience while maintaining exceptional legibility.

*   **Display Scales (lg, md, sm):** Used for heroic impact. These should be set with a slight negative letter-spacing (-0.02em) to feel tightly curated and authoritative.
*   **Headline & Title Scales:** Used for shelter names and primary instructions. These are the "Wayfinders" of the UI.
*   **Body Scales:** Set in `body-lg` (1rem) for most content to ensure high readability for users who may be in motion or experiencing visual stress.
*   **Labels:** Use `label-md` for metadata (distance, capacity). These should always be uppercase with a +0.05em letter-spacing to distinguish them from body copy.

---

## 4. Elevation & Depth
Depth in this design system is achieved through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Avoid "elevation-1, elevation-2" mentalities. Instead, think of "Brightness Depth." An active card should be physically lighter (using `surface_bright`) than the background it sits on.
*   **Ambient Shadows:** When a floating effect is required (e.g., a critical Alert Sheet), use a wide, diffused shadow.
    *   *Formula:* `0px 24px 48px rgba(0, 0, 0, 0.4)`. The shadow must never be harsh; it should feel like an ambient occlusion glow.
*   **The "Ghost Border" Fallback:** If accessibility requirements demand a container boundary, use a "Ghost Border"—the `outline_variant` token at **15% opacity**. This provides a hint of structure without cluttering the visual field.

---

## 5. Components

### Buttons
*   **Primary:** A gradient-filled container (`primary` to `primary_container`) with `on_primary` text. Use `roundedness-lg` (0.5rem) for a modern, approachable feel.
*   **Secondary:** An "Outline-only" look, but using the **Ghost Border** rule. Text color should be `primary`.
*   **Tertiary:** Text-only with an underline that appears only on hover/active states.

### Cards & Lists
*   **The Rule of Space:** Forbid the use of divider lines. Separate list items using the **Spacing Scale** (e.g., `spacing-4` / 1.4rem) or by alternating subtle background shifts between `surface-container-low` and `surface-container-lowest`.
*   **Visual Priority:** High-urgency information (e.g., "3 spots left") should be housed in a small `tertiary_container` chip to draw the eye immediately.

### Input Fields
*   **Style:** Use the `surface-container-highest` as the input background. Do not use a bottom line or full border.
*   **States:** On focus, the container should transition its background to `surface_bright` with a 1px `primary` Ghost Border (20% opacity).

### Chips
*   **Filter Chips:** Use `secondary_container` for unselected and `primary` for selected. Roundedness must be `full` (9999px) to contrast against the more architectural cards.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. For example, a shelter image can bleed off the left edge of a card while text is padded heavily on the right.
*   **Do** prioritize white space. If you think there is enough space, add one more level from the spacing scale (e.g., move from `8` to `10`).
*   **Do** use `surface_tint` at very low opacities (2-5%) over images to make them feel integrated into the dark theme.

### Don't:
*   **Don't** use 100% white (#FFFFFF). Use `on_surface` (`#e7e1e5`) to prevent eye strain in dark environments.
*   **Don't** use standard "Material" shadows. If it looks like a default shadow, it’s too heavy. 
*   **Don't** use icons without purpose. Every icon must be accompanied by a label or be so universally understood (e.g., a phone icon) that it requires no explanation.
*   **Don't** use a divider line to separate a header from a body. Use a `spacing-6` gap and a font-weight jump instead.

---

## 7. Implementation Notes
*   **Font:** Load Raleway in `public/index.html` using the Google Fonts link with `display=swap` and preconnects.
*   **Tokens:** Use CSS variables from `src/styles/design-tokens.css` as the source of truth. Mirror them in Tailwind `theme.extend` for utility classes.
*   **Auth Screens:** Use only tokenized auth utility classes (`bg-auth-*`, `text-auth-*`, `border-auth-*`) to preserve exact light-theme values without hardcoding.
*   **Global Base:** Import tokens and set `body` background/text color in `src/index.css`.
*   **Glass & Ghost:** Use `.glass-panel` (from `src/styles/glass.css`) for glassmorphism and `.ghost-outline` (from `src/styles/accessibility.css`) only when a boundary is required.

*This design system is a living framework. It is intended to be used with intuition and an editorial eye. Always ask: "Does this layout breathe, or does it scream?" We aim for the breath.*