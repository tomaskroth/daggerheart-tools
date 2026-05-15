# Flow Descriptor — PBI-020: Navigation bar restructured into Compendium dropdown and Character Sheet top-level button

**PBI:** PBI-020
**ADR required:** No — this change uses only existing patterns: React local state (`useState`), React Router's `useLocation`, conditional rendering, and CSS `::before`/`::after` pseudo-elements already established in `.type-menu button`. No new dependencies, no new data model, no API changes.

---

## 1. What This Builds

Restructures the navigation area in `App.tsx` into two rows. The primary row holds a "Compendium" toggle button and a "Character Sheet" link button, both styled and decorated identically to the existing TypeMenu SRD category buttons. The secondary row holds the TypeMenu (all SRD category links), shown or hidden based on `isCompendiumOpen` state. The open/closed default follows the active route: open on all routes except `/character-sheet`.

Acceptance scenarios covered: all 10 scenarios in `PBI-020-nav-compendium-dropdown.feature`.

---

## 2. Component Map

| Component | Change | Notes |
|---|---|---|
| `App.tsx` | Modified | Adds `isCompendiumOpen` state; adds `useLocation` effect to set default; renders `.app-nav-primary` and `.app-nav-secondary` rows |
| `App.css` | Modified | Adds styles for `.app-nav-primary`, `.app-nav-secondary`, `.app-nav__btn`; adds diamond `::before`/`::after` decoration on `.app-nav__btn` |
| `TypeMenu.tsx` | No change | Moved into `.app-nav-secondary` wrapper in `App.tsx`; component internals unchanged |

No new components. No backend changes.

---

## 3. Data Flow

```mermaid
flowchart TD
    A[App mounts / route changes] -->|useLocation pathname| B{pathname === '/character-sheet'?}
    B -->|yes| C[setIsCompendiumOpen(false)]
    B -->|no| D[setIsCompendiumOpen(true)]

    E[User clicks Compendium button] --> F[setIsCompendiumOpen(prev => !prev)]

    G[User clicks Character Sheet button] --> H[React Router navigates to /character-sheet]
    H --> B

    C --> I[Secondary nav row hidden]
    D --> J[Secondary nav row visible]
    F --> K[Secondary nav row toggles]
```

**State location:** `isCompendiumOpen: boolean` — local state in `App.tsx` via `useState`.

**Route sync:** A `useEffect` keyed on `location.pathname` sets `isCompendiumOpen` to `false` when pathname is `/character-sheet`, `true` otherwise.

---

## 4. API Contract

No API changes. This is a purely frontend layout and state change.

---

## 5. Security Notes

No security implications. This change affects only navigation layout and a client-side open/closed toggle. No user input is collected, no data is persisted, no auth state is involved. The TypeMenu buttons' existing behaviour (type filtering, navigation) is unchanged.

---

## 6. Consistency Notes

- **Local state pattern:** `useState` for `isCompendiumOpen` follows the same local state pattern used throughout `App.tsx` (e.g., `darkMode`, `searchQuery`, `selectedType`). No deviation.
- **Route-aware effect:** `useEffect` keyed on `useLocation().pathname` follows the React Router pattern already used in the codebase. No new pattern.
- **Diamond decoration:** Reuses the identical `::before`/`::after` CSS pseudo-element pattern from `.type-menu button` (lines 86–104 of `App.css`). No new CSS pattern.
- **Button style:** `.app-nav__btn` uses the same colour tokens (`#4a2a99` background, `#ffd166` text, `#d4b04f` border) as the existing `.type-menu button` and `.app-nav__link` styles. No new design tokens.
- Follows ADR-011 (React Router URL Navigation) — navigation remains BrowserRouter-based.
