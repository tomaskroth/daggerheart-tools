# Flow Descriptor — PBI-021: Character sheet identity row full-width and traits 6-column inline layout

**PBI:** PBI-021
**ADR required:** No — pure layout restructure. No state changes, no new components, no API changes, no new patterns. Follows the existing full-width section pattern already established by `ClassFeatureSection` in `CharacterSheetPage.tsx`.

---

## 1. What This Builds

Moves `ClassHeader` and `TraitsSection` out of the left column in `CharacterSheetPage.tsx` and places them as full-width rows above the two-column grid. `TraitsSection`'s internal CSS grid is updated from `repeat(3, 1fr)` to `repeat(6, 1fr)` so all six traits display side by side in a single row. Everything below (DefenceSection, DamageHealthSection, HopeSection, ExperienceSection, GoldSection, ActiveWeaponsSection, ActiveArmorSection, InventorySection) remains in the unchanged two-column grid. `ClassFeatureSection` remains full-width below the grid as before.

Acceptance scenarios covered: all 6 scenarios in `PBI-021-character-sheet-identity-traits-layout.feature`.

---

## 2. Component Map

| Component | Change | Notes |
|---|---|---|
| `CharacterSheetPage.tsx` | Modified | Removes `ClassHeader` and `TraitsSection` from left column; renders them in wrapper divs above `.character-sheet__columns` |
| `TraitsSection.tsx` | Modified | CSS class `.traits-section__columns` grid updated from `repeat(3, 1fr)` to `repeat(6, 1fr)`; responsive breakpoint added to collapse to `repeat(3, 1fr)` at ≤768px |
| `App.css` | Modified | Adds `.character-sheet__identity-row` and `.character-sheet__traits-row` wrapper styles; updates `.traits-section__columns` grid |
| `ClassHeader.tsx` | No change | Component internals unchanged |

No new components. No backend changes. No state changes.

---

## 3. Data Flow

No data flow changes. All hooks (`useCharacterIdentity`, `useCharacterTraits`) remain unchanged. The only change is DOM structure and CSS layout.

```
CharacterSheetPage
├── .character-sheet__identity-row  [NEW wrapper — full-width]
│   └── <ClassHeader />              [moved from left column]
├── .character-sheet__traits-row    [NEW wrapper — full-width]
│   └── <TraitsSection />            [moved from left column; internal grid updated]
├── .character-sheet__columns       [unchanged 2-col grid]
│   ├── left: DefenceSection, DamageHealthSection, HopeSection, ExperienceSection, GoldSection
│   └── right: ActiveWeaponsSection, ActiveArmorSection, InventorySection
└── <ClassFeatureSection />          [unchanged full-width below grid]
```

---

## 4. API Contract

No API changes.

---

## 5. Security Notes

No security implications. This is a layout-only change. No user input handling changes. No data persistence involved.

---

## 6. Consistency Notes

- **Full-width section pattern:** Moving components outside `.character-sheet__columns` and rendering them as full-width rows is the same pattern used for `ClassFeatureSection` (PBI-016). No deviation from established practice.
- **CSS grid update:** Changing `.traits-section__columns` from `repeat(3, 1fr)` to `repeat(6, 1fr)` is a straightforward CSS property change. Responsive collapse to `repeat(3, 1fr)` at ≤768px preserves usability on narrow viewports and mirrors the existing responsive pattern in `.character-sheet__columns`.
- Follows ADR-012 (Character Sheet State Management) — no state structure changes.
