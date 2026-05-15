# Design Specification — PBI-024: Theme-consistent select elements

**PBI:** PBI-024
**Design Agent output date:** 2026-05-15
**Status:** Draft

---

## 1. Feature Summary

All `<select>` elements on the character sheet (class, heritage, subclass in the identity bar; weapon picker; armor picker) are styled to match the app's existing dark-fantasy visual language. The OS-native white control and browser-default arrow are replaced with the established gold-border/dark-background (dark mode) or gold-border/white-background (light mode) treatment already used for text inputs, plus a CSS-rendered chevron arrow in the gold accent color.

---

## 2. Scope

**IN scope for this design:**
- `appearance: none` to suppress the OS-native select rendering on all character sheet selects
- Custom dropdown arrow via CSS `background-image` (inline SVG data URI), rendered in the gold accent color, adapting between light and dark mode
- `padding-right` increased on all selects to prevent text from running under the custom arrow
- Hover state: gold border brightens slightly (same treatment as text inputs if one exists; otherwise a subtle opacity shift)
- Focus state: gold outline ring (accessible, WCAG AA contrast against both light and dark backgrounds)
- Disabled state (subclass dropdown while no class is selected): muted opacity, cursor `not-allowed`
- New CSS rule for `.weapon-panel__select` — currently unstyled; must receive the full themed treatment
- Dark mode overrides for custom arrow color (`#a88b32`)

**OUT of scope:**
- Replacing `<select>` with a custom React component or third-party library
- Styling `<select>` elements outside the character sheet (none exist currently)
- Changes to option content, values, or dropdown behaviour
- Structural JSX changes (no wrapper divs needed — CSS-only approach)
- Level field — confirmed as `<input type="number">` not a `<select>`; out of scope

---

## 3. Pages and Routes Affected

| Route | Page/Component | New or Modified |
|---|---|---|
| `/character-sheet` | `App.css` | Modified — existing select rules extended; new `.weapon-panel__select` rule added |

No component `.tsx` files require modification — this is a CSS-only change.

---

## 4. Component Inventory

| Component | Status | Location | Responsibility |
|---|---|---|---|
| `App.css` | Modified | `src/App.css` | Adds `appearance: none`, custom arrow, hover/focus/disabled states to all character sheet selects; adds full styling for `.weapon-panel__select` |

No new components. No existing component files modified.

---

## 5. Layout and Visual Structure

### Select element — visual anatomy

All character sheet selects share one visual pattern. The only differences between light and dark mode are the specific color values (governed by existing `.dark-mode` override rules).

```
┌─────────────────────────────────────────┐
│  — Select class —               ▾       │   ← gold border, theme bg
│                                         │   ← arrow: right-aligned, gold
└─────────────────────────────────────────┘

Light mode:  bg white (#ffffff), text #2c2a33, border #d4b04f, arrow #d4b04f
Dark mode:   bg #18122b, text #f3e9ff, border #a88b32, arrow #a88b32
```

### CSS property additions (light mode base rules)

Additions to **`.character-sheet__section select`** and **`.class-header__field select`** (both already exist):

| Property | Value | Purpose |
|---|---|---|
| `appearance` | `none` | Suppress OS-native chrome |
| `-webkit-appearance` | `none` | Safari / Chrome compat |
| `background-image` | Inline SVG chevron in `#d4b04f` | Custom arrow |
| `background-repeat` | `no-repeat` | Single arrow instance |
| `background-position` | `right 0.75rem center` | Arrow pinned to right edge |
| `background-size` | `1rem 1rem` | Arrow size matches font scale |
| `padding-right` | `2.5rem` | Prevent text running behind arrow |
| `cursor` | `pointer` | Already present; confirm it is set |

Dark mode override additions to **`.dark-mode .character-sheet__section select`** and **`.dark-mode .class-header__field select`** (both already exist):

| Property | Value |
|---|---|
| `background-image` | Same SVG chevron, recolored `#a88b32` |

### New rule — weapon panel select

`.weapon-panel__select` currently has no CSS. This rule must be added:

**Light mode:**
```
background-color: white
color: #2c2a33
border: 2px solid #d4b04f
border-radius: 0.3rem
padding: 0.35rem 2.5rem 0.35rem 0.5rem
font-size: 0.95rem
font-family: inherit
width: 100%
box-sizing: border-box
cursor: pointer
appearance: none
-webkit-appearance: none
background-image: [SVG chevron #d4b04f]
background-repeat: no-repeat
background-position: right 0.75rem center
background-size: 1rem 1rem
```

**Dark mode (`.dark-mode .weapon-panel__select`):**
```
background-color: #18122b
color: #f3e9ff
border-color: #a88b32
background-image: [SVG chevron #a88b32]
```

### Custom arrow — SVG specification

The arrow is a simple downward-pointing chevron (two diagonal strokes forming a `>` rotated 90°). The exact SVG path is left to the implementation agent; it must:
- Be a clean inline `data:image/svg+xml,` URI (URL-encoded, not base64)
- Use `stroke` not `fill` (clean line, not solid shape) — OR `fill` with a solid triangle; either is acceptable provided it is visually distinct at `1rem`
- Use `currentColor` is NOT available in `background-image` SVGs — the color must be hardcoded per mode

### Responsive behaviour

No new responsive breakpoints. Selects already use `width: 100%` and inherit their container's responsive behaviour from existing grid/layout rules. The arrow remains right-aligned at all widths.

---

## 6. Interaction Specification

### Select — state matrix

| State | Visual treatment |
|---|---|
| Default (light) | White bg, `#2c2a33` text, `#d4b04f` border `2px`, gold chevron |
| Default (dark) | `#18122b` bg, `#f3e9ff` text, `#a88b32` border `2px`, muted gold chevron |
| Hover (light) | Border brightens to `#c9a84c` (a step warmer than `#d4b04f`) or border width increases to `3px` — implementation agent chooses; must be visibly distinct from default |
| Hover (dark) | Border lightens to `#c9a84c` or border width increases to `3px` — same principle |
| Focus (light) | Gold outline ring: `outline: 2px solid #d4b04f; outline-offset: 2px` — must not be suppressed |
| Focus (dark) | Gold outline ring: `outline: 2px solid #a88b32; outline-offset: 2px` |
| Disabled (light) | `opacity: 0.5; cursor: not-allowed` — applies to subclass select while no class is chosen |
| Disabled (dark) | Same `opacity: 0.5; cursor: not-allowed` |
| Open (dropdown expanded) | Native OS dropdown panel — not styled (OS-rendered; appearance: none does not remove the open panel on all platforms) |

**Note on hover state:** The implementation agent must choose between a border-color shift and a border-width shift. Either is acceptable. The chosen approach must be applied consistently across all selects and all modes.

---

## 7. Copy and Labels

No new copy. All placeholder text (`— Select class —`, `Select a weapon…`, etc.) is unchanged. No labels added or removed.

---

## 8. Accessibility Notes

- **Focus ring must not be removed.** The `outline: none` or `outline: 0` pattern is forbidden on these selects. The gold outline ring (Section 6) is the focus indicator.
- **WCAG AA contrast:** Gold `#d4b04f` on white passes AA for UI components (border/icon). Dark text `#2c2a33` on white passes AA for text. Light text `#f3e9ff` on `#18122b` passes AA. The implementation agent must not introduce a new color combination without checking contrast.
- **Disabled select:** Subclass select uses the HTML `disabled` attribute (already in place). No additional ARIA attributes are needed — `disabled` suppresses focus and is announced by screen readers.
- **Custom arrow is decorative.** The SVG `background-image` arrow is a CSS background on the select element itself — it is not an accessible element and requires no `aria-label`. The `<select>` already has `aria-label` or an associated `<label>` element.
- **Keyboard navigation:** `<select>` is natively keyboard-accessible. No changes to keyboard behaviour.

---

## 9. Design Decisions and Rationale

| Decision | Alternatives considered | Rationale |
|---|---|---|
| CSS `background-image` SVG arrow (no wrapper div) | Wrapper `<div>` with `::after` pseudo-element | Background-image requires zero JSX changes — only CSS additions. Wrapper divs would require modifying ClassHeader, WeaponPanel, and ActiveArmorSection JSX, adding structural coupling for a purely visual concern. |
| Hardcode arrow color per mode in SVG data URI | Use `filter: invert()` or `filter: brightness()` to recolor a single SVG | Data URI color is explicit and predictable. CSS filter approaches to recolor can produce imprecise hues and are fragile across browsers. Two SVG declarations (one per mode) is the simplest correct solution. |
| Extend existing `.character-sheet__section select` rule | Create a new shared `.select-styled` class | The existing selectors already target the right elements (ClassHeader uses `.class-header__field select`; ArmorSection and other sections use `.character-sheet__section select`). Adding a new class would require JSX changes to every component. Extending existing rules requires only CSS edits. |
| New rule for `.weapon-panel__select` | Add `character-sheet__section` class to WeaponPanel's parent | WeaponPanel's parent class (`weapon-panel--primary`) is semantic — adding `character-sheet__section` to it would misuse a layout class for styling targeting. A specific `.weapon-panel__select` rule is cleaner. |

---

## 10. Open Design Questions

No open design questions.

---

## 11. Scenario Traceability

| Scenario | Addressed by |
|---|---|
| Select elements render with a light background in light mode | Section 5 — Default (light) state; App.css `background-color: white` |
| Select elements render with a dark background in dark mode | Section 5 — Default (dark) state; App.css `.dark-mode` override `background-color: #18122b` |
| Select elements display dark text in light mode | Section 5 — `color: #2c2a33` in light rule |
| Select elements display light text in dark mode | Section 5 — `color: #f3e9ff` in dark override |
| Select elements display a gold border in light mode | Section 5 — `border: 2px solid #d4b04f` |
| Select elements display a muted gold border in dark mode | Section 5 — `border-color: #a88b32` dark override |
| Select elements display a custom dropdown arrow in light mode | Section 5 — `appearance: none` + `background-image` SVG `#d4b04f` |
| Select elements display a custom dropdown arrow in dark mode | Section 5 — `background-image` SVG override `#a88b32` in dark mode |
| No select element displays the default OS-native dropdown arrow | Section 5 — `appearance: none; -webkit-appearance: none` |
| Toggling from light to dark mode updates select styling | Section 5 — `.dark-mode` class toggle; all rules use that selector |
| Toggling from dark to light mode updates select styling | Section 5 — same; removing `.dark-mode` class reverts to base rules |
| Class dropdown retains correct theme styling after a selection | Section 6 — Default state persists; selection does not alter CSS class |
| Subclass dropdown is styled correctly after a class is chosen | Section 6 — Disabled → Default state transition (CSS only, via `disabled` attribute) |
| Weapon dropdown is styled correctly in both modes | Section 5 — New `.weapon-panel__select` rule covering both modes |
| Armor dropdown is styled correctly in both modes | Section 5 — Covered by `.character-sheet__section select` (ActiveArmorSection has that class) |
| A focused select element shows a visible focus ring in light mode | Section 6 — Focus state: `outline: 2px solid #d4b04f` |
| A focused select element shows a visible focus ring in dark mode | Section 6 — Focus state: `outline: 2px solid #a88b32` |
| A disabled select element remains readable in light mode | Section 6 — Disabled state: `opacity: 0.5` on white bg |
| A disabled select element remains readable in dark mode | Section 6 — Disabled state: `opacity: 0.5` on `#18122b` bg |
