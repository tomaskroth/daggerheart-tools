# Design Specification — PBI-021: Character sheet identity row full-width and traits 2-column layout

**PBI:** PBI-021
**Design Agent output date:** 2026-05-15
**Status:** Draft (revised — traits internal layout updated to 6-column single row)

---

## 1. Feature Summary

The character sheet is restructured so that the identity fields (Name, Pronouns, Class, Subclass, Heritage, Level) appear as a single full-width row spanning both columns, and the trait scores section appears as a full-width row immediately below it. All other sections remain in the existing two-column layout beneath the traits row.

---

## 2. Scope

**IN scope for this design:**
- `ClassHeader` component moved out of the left column and into its own full-width row above the column grid
- `TraitsSection` component moved out of the left column and into a full-width row between the identity row and the column grid
- All remaining sections (`DefenceSection`, `DamageHealthSection`, `HopeSection`, `ExperienceSection`, `GoldSection`, `ActiveWeaponsSection`, `ActiveArmorSection`, `InventorySection`) remain in the existing two-column grid unchanged
- `ClassFeatureSection` remains below the grid (full-width, unchanged)

**OUT of scope:**
- Changes to which fields appear in the identity or traits sections
- Changes to character state or data
- Changes to any section other than layout positioning of ClassHeader and TraitsSection

---

## 3. Pages and Routes Affected

| Route | Page/Component | New or Modified |
|---|---|---|
| `/character-sheet` | `CharacterSheetPage.tsx` | Modified — layout restructured |
| `/character-sheet` | `App.css` | Modified — new layout rules for identity and traits rows |

---

## 4. Component Inventory

| Component | Status | Location | Responsibility |
|---|---|---|---|
| `CharacterSheetPage.tsx` | Modified | `src/features/character-sheet/components/CharacterSheetPage.tsx` | Moves `ClassHeader` and `TraitsSection` to full-width rows above the column grid |
| `App.css` | Modified | `src/App.css` | Adds full-width layout rules for the identity and traits rows within the character sheet |
| `ClassHeader.tsx` | No change | `src/features/character-sheet/components/ClassHeader.tsx` | Component internals unchanged |
| `TraitsSection.tsx` | Modified | `src/features/character-sheet/components/TraitsSection.tsx` | Internal grid changed from `repeat(3, 1fr)` to `repeat(6, 1fr)` — all 6 traits displayed in a single inline row |

---

## 5. Layout and Visual Structure

### Character Sheet page

```
┌────────────────────────────────────────────────────────────────────┐
│  Character Sheet                               (page title)         │
├────────────────────────────────────────────────────────────────────┤
│  Name: [___________]  Pronouns: [______]  Class: [________▾]       │  ← full-width (.character-sheet__identity-row)
│  Subclass: [_______▾] Heritage: [______▾] Level: [__]              │    ClassHeader spans both columns
├────────────────────────────────────────────────────────────────────┤
│  Agility│Strength│Finesse│Instinct│Presence│Knowledge              │  ← full-width (.character-sheet__traits-row)
│  [___] │ [___]  │ [___] │ [___]  │ [___]  │ [___]                 │    all 6 trait columns side by side
│  Sprint │ Lift   │Control│Perceive│ Charm  │Recall                 │    repeat(6, 1fr) internal grid
│  Leap   │ Smash  │ Hide  │ Sense  │Perform │Analyze                │
│  Maneuvr│ Grapple│Tinker │Navigate│Deceive │Comprehend             │
├──────────────────────────────┬─────────────────────────────────────┤
│  LEFT COLUMN                 │  RIGHT COLUMN                        │  ← existing .character-sheet__columns grid
│  DefenceSection              │  ActiveWeaponsSection               │    (unchanged)
│  DamageHealthSection         │  ActiveArmorSection                 │
│  HopeSection                 │  InventorySection                   │
│  ExperienceSection           │                                     │
│  GoldSection                 │                                     │
├────────────────────────────────────────────────────────────────────┤
│  ClassFeatureSection                                                │  ← full-width (unchanged)
└────────────────────────────────────────────────────────────────────┘
```

**Identity row (`.character-sheet__identity-row`):**
- Full-width wrapper outside of `.character-sheet__columns`
- Renders `<ClassHeader />` directly
- `ClassHeader`'s internal `.class-header__identity` grid (`1fr 1fr`, 6 fields in 2 columns) is unchanged — it now simply has more available horizontal space
- Section card styling (`.character-sheet__section`) applies to `ClassHeader` as before

**Traits row (`.character-sheet__traits-row`):**
- Full-width wrapper outside of `.character-sheet__columns`
- Renders `<TraitsSection />` directly
- `TraitsSection`'s internal `.traits-section__columns` grid changes from `repeat(3, 1fr)` to `repeat(6, 1fr)` — all 6 trait columns sit side by side in a single row
- Section card styling applies as before

**Column grid (`.character-sheet__columns`):**
- Unchanged: `grid-template-columns: 1fr 1fr`, same sections as before minus `ClassHeader` and `TraitsSection`

**Sizing and spacing notes:**
- `.character-sheet__identity-row` and `.character-sheet__traits-row` have the same `margin-bottom: 1rem` as section cards to maintain vertical rhythm
- No change to max-width or padding of the `.character-sheet` container

**Responsive behaviour:**
- At ≤768px (single-column breakpoint), the identity row and traits row already render full-width — no additional responsive change needed
- `TraitsSection`'s internal grid should collapse from `repeat(6, 1fr)` to `repeat(3, 1fr)` at ≤768px (matching the previous desktop layout), and to `repeat(2, 1fr)` at ≤480px if needed. The exact breakpoints are an implementation detail for the Architecture/Implementation Agent to confirm.

---

## 6. Interaction Specification

No new interactions. All fields remain editable as before. Focus management unchanged.

---

## 7. Copy and Labels

No copy changes. All field labels remain identical.

---

## 8. Accessibility Notes

- No changes to heading hierarchy (each section retains its `<h2>`)
- Reading order in the DOM should match the visual order: identity row first, traits row second, columns grid third — `CharacterSheetPage.tsx` must render them in this order
- No new ARIA requirements introduced

---

## 9. Design Decisions and Rationale

| Decision | Alternatives considered | Rationale |
|---|---|---|
| `TraitsSection` internal grid changed to `repeat(6, 1fr)` | Keep `repeat(3, 1fr)` in wider space; use `repeat(2, 1fr)` | The user explicitly requested all 6 traits displayed inline (side by side). `repeat(6, 1fr)` achieves this. The full-width row gives sufficient horizontal space for 6 reasonably-sized columns on desktop. |
| `ClassHeader` and `TraitsSection` placed in wrapper divs above the column grid | `grid-column: 1 / -1` inside the column grid | Wrapper divs outside the grid are cleaner than spanning grid items, which can interfere with the `align-items: start` rule on the column grid. |
| `ClassHeader` internal layout unchanged (2-col `class-header__identity` grid) | Expand to 3-col or single row | The 6 fields in 2 columns is already readable and compact. The user did not request a change to the identity fields themselves — only to their position on the page. |

---

## 10. Open Design Questions

No open design questions.

---

## 11. Scenario Traceability

| Scenario | Addressed by |
|---|---|
| Identity row spans the full width of the character sheet | Section 5 — Identity row layout |
| Trait scores section is displayed in a 2-column layout below the identity row | Section 5 — Traits row layout; Section 9 — TraitsSection spans both page columns |
| Identity row is displayed above the traits section | Section 5 — DOM order (identity row → traits row → column grid) |
| Sections below the traits block remain in the existing 2-column layout | Section 5 — Column grid unchanged |
| Identity fields remain editable after layout change | Section 6 — No interaction changes; ClassHeader internals unchanged |
| Trait score inputs remain editable after layout change | Section 6 — No interaction changes; TraitsSection internals unchanged |
