# Design Specification — PBI-020: Navigation bar restructured into Compendium dropdown and Character Sheet top-level button

**PBI:** PBI-020
**Design Agent output date:** 2026-05-15
**Status:** Draft

---

## 1. Feature Summary

The navigation bar is split into two levels: a primary nav row with a "Compendium" toggle button and a "Character Sheet" button, and a secondary nav row containing all SRD category links. Both primary buttons carry the same diamond corner decoration currently used on SRD category buttons. The compendium secondary row opens and closes when the user clicks "Compendium", and its default state follows the active route.

---

## 2. Scope

**IN scope for this design:**
- Primary navigation row: "Compendium" button and "Character Sheet" button
- Secondary navigation row: all SRD category links (moved from their current position in the header)
- Diamond corner decorations on both primary buttons
- Route-aware default open/closed state for the secondary row
- Search bar position and appearance unchanged

**OUT of scope:**
- Animated transitions on the secondary row (show/hide only)
- Changes to the SRD category list or TypeMenu button styling
- Any change to the Character Sheet page

---

## 3. Pages and Routes Affected

| Route | Page/Component | New or Modified |
|---|---|---|
| All routes | `App.tsx` (navigation area) | Modified |
| All routes | `App.css` (nav styles) | Modified |
| All routes | New `.app-nav-primary` and `.app-nav-secondary` nav rows | New |
| `/` | Secondary row open by default | Modified behaviour |
| `/:type/:filename` | Secondary row open by default | Modified behaviour |
| `/character-sheet` | Secondary row collapsed by default | Modified behaviour |

---

## 4. Component Inventory

| Component | Status | Location | Responsibility |
|---|---|---|---|
| `App.tsx` | Modified | `src/App.tsx` | Adds `isCompendiumOpen` state; renders two nav rows; derives default open state from route |
| `App.css` | Modified | `src/App.css` | Adds styles for `.app-nav-primary`, `.app-nav-secondary`, `.app-nav__btn`, and diamond pseudo-elements |
| `TypeMenu` | Modified | `src/components/TypeMenu.tsx` | Moves into the secondary nav row (rendered inside `.app-nav-secondary`); no internal changes needed |

---

## 5. Layout and Visual Structure

### Navigation area — all routes

```
┌────────────────────────────────────────────────────────────────┐
│  [Title/Logo]    [Search bar ........................]  [🌙]   │  ← existing app-header row (unchanged)
├────────────────────────────────────────────────────────────────┤
│  ◆ Compendium ◆       ◆ Character Sheet ◆                     │  ← primary nav row (.app-nav-primary)
├────────────────────────────────────────────────────────────────┤
│  [Ancestries] [Armor] [Classes] [Communities] [Items] [...]   │  ← secondary nav row (.app-nav-secondary)
│                                   (visible when open)         │
└────────────────────────────────────────────────────────────────┘
```

**Primary nav row (`.app-nav-primary`):**
- Contains exactly two buttons: "Compendium" and "Character Sheet"
- Both use the same visual style as the current TypeMenu SRD category buttons: purple background, gold border, gold text
- Both have the diamond `::before` and `::after` pseudo-element decoration (10×10px rotated squares, gold, positioned at top-left and bottom-right corners — identical pattern to `.type-menu button::before` / `::after`)
- Row is full-width, flush below the app-header

**Secondary nav row (`.app-nav-secondary`):**
- Contains the TypeMenu buttons (all SRD categories)
- Uses the same button styling as the current TypeMenu
- Shown when `isCompendiumOpen` is `true`; hidden when `false`
- Show/hide via CSS `display: none` / `display: flex` (no animation)

**Sizing and spacing notes:**
- Primary nav buttons: same padding, font-size, and border as current TypeMenu buttons
- Both rows are full-width, same left/right padding as the app-header
- Buttons in both rows wrap on small viewports (flex-wrap)

**Responsive behaviour:**
- Both rows use `flex-wrap: wrap` — buttons wrap naturally on narrow viewports

---

## 6. Interaction Specification

### Toggle compendium secondary row

**Trigger:** User clicks the "Compendium" button  
**Precondition:** Any route; secondary row may be open or closed  
**Outcome:** Secondary row visibility toggles (open → closed, closed → open)

| State | Visual treatment |
|---|---|
| Secondary row open | "Compendium" button renders with an active/pressed background (slightly lighter or with `opacity: 0.85`) to indicate the row is expanded |
| Secondary row closed | "Compendium" button renders in its standard state |

### Navigate to Character Sheet

**Trigger:** User clicks the "Character Sheet" button  
**Precondition:** Any route  
**Outcome:** React Router navigates to `/character-sheet`; secondary nav row collapses (if open)

### Route-aware default state

**Rule:** `isCompendiumOpen` is initialised based on the current route when the component mounts, and resets whenever the route changes:
- Route is `/character-sheet` → secondary row closed
- Any other route (including `/`, `/:type/:filename`, unknown routes) → secondary row open

**Implementation note for Architecture Agent:** `useLocation()` from `react-router-dom` provides the pathname. A `useEffect` keyed on `pathname` sets `isCompendiumOpen` appropriately.

### Click an SRD category in the secondary row

**Trigger:** User clicks any TypeMenu button in the secondary row  
**Precondition:** Secondary row is visible  
**Outcome:** Existing TypeMenu behaviour (sets type filter, navigates) — unchanged

---

## 7. Copy and Labels

| Element | Copy | Notes |
|---|---|---|
| Primary nav button 1 | "Compendium" | Title case; matches current header title |
| Primary nav button 2 | "Character Sheet" | Title case; matches current link text |

---

## 8. Accessibility Notes

- The "Compendium" button must have `aria-expanded` set to `"true"` or `"false"` based on secondary row visibility
- The secondary nav row element should have `aria-hidden="true"` when collapsed
- Both primary nav buttons are keyboard-focusable and activatable with Enter/Space (standard `<button>` behaviour)
- Colour contrast: diamond decoration gold (`#d4b04f`) against purple button background meets WCAG AA for decorative elements; button text contrast already established by existing TypeMenu styles

---

## 9. Design Decisions and Rationale

| Decision | Alternatives considered | Rationale |
|---|---|---|
| Primary nav buttons styled identically to TypeMenu buttons | Distinct "top-level" style (e.g., larger, different colour) | Visual consistency — using one button style throughout the nav avoids a two-tier visual hierarchy that would require additional design tokens and user orientation. |
| Route-aware default: secondary row open on all non-character-sheet routes | Always collapsed on load; always open | Compendium is the primary use case. Opening it by default keeps category links discoverable without requiring an extra click on every visit. Character Sheet route collapses it to reduce visual noise. |
| `display: none` show/hide, no animation | CSS `max-height` transition | The OUT scope explicitly excludes animated transitions. This keeps the implementation trivial and avoids layout-shift edge cases. |
| Diamond decoration reuses existing `::before` / `::after` pattern from `.type-menu button` | New shared CSS class | Reusing the identical pattern is zero-risk and requires no refactoring of existing styles. |
| `isCompendiumOpen` state lives in `App.tsx` | Dedicated NavBar component; React Context | The state is local to the nav area. No other component needs it. Keeping it in `App.tsx` avoids unnecessary component extraction. |

---

## 10. Open Design Questions

No open design questions.

---

## 11. Scenario Traceability

| Scenario | Addressed by |
|---|---|
| Primary navigation row contains Compendium and Character Sheet buttons | Section 5 — Primary nav row layout |
| Landing on the homepage shows the compendium secondary row open by default | Section 6 — Route-aware default state |
| Clicking Compendium collapses the secondary row when it is open | Section 6 — Toggle interaction |
| Clicking Compendium expands the secondary row when it is collapsed | Section 6 — Toggle interaction |
| Clicking Character Sheet navigates to the character sheet page | Section 6 — Navigate to Character Sheet |
| Navigating to the character sheet collapses the secondary navigation row | Section 6 — Route-aware default state |
| Navigating directly to a compendium item page shows the secondary row open | Section 6 — Route-aware default state |
| Compendium button has diamond corner decorations | Section 5 — Primary nav row; Section 9 — Diamond decoration decision |
| Character Sheet button has diamond corner decorations | Section 5 — Primary nav row; Section 9 — Diamond decoration decision |
| Search bar remains present and usable after navigation restructure | Section 2 — Scope (search bar unchanged); Section 5 — app-header row unchanged |
