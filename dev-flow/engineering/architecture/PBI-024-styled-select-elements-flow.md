# Flow Descriptor — PBI-024: Theme-consistent select elements

**PBI:** PBI-024
**Architecture Agent output date:** 2026-05-15
**ADR required:** No — see rationale below

---

## ADR Decision

No ADR is required for this PBI. Evaluation against each trigger:

| Trigger | Assessment |
|---|---|
| New external dependency | No — CSS only, no new library |
| Data model change | No — no state changes |
| New or changed API endpoint | No |
| Auth/authz change | No |
| New pattern not present in codebase | No — `appearance: none` + SVG `background-image` is a standard CSS technique; the existing codebase already uses `background-image` for decorative purposes and inline SVG data URIs for icons |
| Meaningful trade-off requiring documentation | The CSS background-image vs wrapper-div trade-off is already fully documented in Section 9 of the approved Design Specification (PBI-024-styled-select-elements-design.md). Re-documenting it as an ADR adds no new information. |
| Hard to reverse | No — CSS changes are trivially reverted |

---

## 1. What This Builds

PBI-024 adds `appearance: none` to suppress the OS-native select control rendering, then replaces the browser-default dropdown arrow with a CSS-rendered chevron in the gold accent color. The background, text, and border colors already exist in `App.css` for most selects; those rules are extended in place. The weapon panel select, which currently has no CSS at all, receives a full new rule matching the established character sheet select pattern.

All changes are confined to `src/App.css`. No component `.tsx` files are modified.

The change adapts to the existing light/dark mode toggle: the `.dark-mode` class on `document.body` governs which color set is active. No new switching logic is needed.

---

## 2. Component Map

| File | Status | Change |
|---|---|---|
| `src/App.css` | Modified | Add `appearance: none`, `-webkit-appearance: none`, `background-image` SVG arrow, `padding-right: 2.5rem` to existing `.character-sheet__section select` and `.class-header__field select` rules; add dark-mode override for arrow color to existing `.dark-mode` rules; add new `.weapon-panel__select` rule (light and dark) |
| `ClassHeader.tsx` | Unchanged | Select elements already present; no JSX modification needed |
| `WeaponPanel.tsx` | Unchanged | `.weapon-panel__select` className already on the select element |
| `ActiveArmorSection.tsx` | Unchanged | Select inside `.character-sheet__section`; covered by existing selector |

---

## 3. Data Flow

There is no data flow change. This PBI affects only the visual rendering of existing `<select>` elements. The selects remain bound to the same state and handlers as before.

The only runtime event of note is the dark-mode toggle:

```
User clicks dark-mode-toggle button
  → toggleDarkMode() in App.tsx
  → .dark-mode class added/removed from document.body + document.documentElement
  → CSS cascade recalculates select styles via .dark-mode selectors
  → Select elements re-render with updated background/text/border/arrow colors
```

No React re-render is triggered for the selects themselves — the style change is driven entirely by the CSS cascade responding to the class toggle.

---

## 4. API Contract

Not applicable. No backend changes. No new endpoints. No existing endpoint changes.

---

## 5. Security Notes

- **No new trust boundaries.** This change is purely visual — no user input is processed, no data is fetched, no new DOM event handlers are introduced.
- **SVG data URIs:** The custom arrow is a static, hardcoded inline SVG in the CSS. It does not accept user input and cannot be influenced by external data. No XSS or injection surface is created.
- **No new dependencies.** Nothing is loaded from an external CDN or third-party source.

Security posture: unchanged from pre-PBI state.

---

## 6. Consistency Notes

- Follows the established light/dark mode pattern: base rule for light mode, `.dark-mode` override for dark mode. Every other form control in `App.css` (inputs, textareas) uses this same structure.
- `appearance: none` with SVG `background-image` arrow is the standard CSS-only approach to custom select styling. No codebase pattern is broken or extended in an unusual direction.
- The new `.weapon-panel__select` rule mirrors the structure of `.character-sheet__section select` exactly — same properties, same values, same dark-mode override structure. This is consistent with ADR-010 (no API calls in components) and ADR-009 (Vite/CSS pipeline) which place no constraints on CSS authoring style.
- The design decision to avoid wrapper divs (documented in the Design Specification, Section 9) keeps this change purely additive to `App.css` and avoids touching JSX in ClassHeader, WeaponPanel, or ActiveArmorSection.

---

## Implementation Checklist for the Implementation Agent

1. In the existing `.character-sheet__section select` rule: add `appearance: none`, `-webkit-appearance: none`, `background-image` (SVG chevron, color `#d4b04f`), `background-repeat: no-repeat`, `background-position: right 0.75rem center`, `background-size: 1rem 1rem`, `padding-right: 2.5rem`
2. In the existing `.dark-mode .character-sheet__section select` rule: add `background-image` (same SVG chevron, color `#a88b32`)
3. In the existing `.class-header__field select` rule: add the same `appearance: none` properties and SVG arrow as step 1
4. In the existing `.dark-mode .class-header__field select` rule: add dark-mode `background-image` override as step 2
5. Add a new `.weapon-panel__select` rule with the full light-mode select styling (background, color, border, appearance, arrow, padding)
6. Add a new `.dark-mode .weapon-panel__select` rule with dark-mode overrides
7. Add hover state rules (border-color or border-width shift — consistent across all selects and both modes)
8. Add focus state rules (`outline: 2px solid [gold]; outline-offset: 2px`) — must not suppress the outline
9. Add disabled state rule (`opacity: 0.5; cursor: not-allowed`) — applies to the subclass select when no class is selected
10. Verify the SVG arrow does not clip or overlap option text at all standard select widths
