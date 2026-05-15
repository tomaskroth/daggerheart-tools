# Flow Descriptor — PBI-023: Compact identity bar — three fields per row

**PBI:** PBI-023
**Architecture Agent output date:** 2026-05-15
**ADR required:** No

---

## 1. What This Builds

Changes the `.class-header__identity` CSS grid from two equal columns (`1fr 1fr`) to three equal columns (`repeat(3, 1fr)`), compacting the six identity fields from three rows into two. Adds responsive overrides to collapse to two columns at ≤768 px and one column at ≤480 px.

No JSX, no logic, no hooks, and no backend components are touched.

---

## 2. Component Map

| Component | Layer | Change |
|---|---|---|
| `.class-header__identity` (CSS rule in `App.css`) | Frontend — styles | `grid-template-columns` updated |
| `@media (max-width: 768px)` block in `App.css` | Frontend — styles | New rule for `.class-header__identity` added |
| `@media (max-width: 480px)` block in `App.css` | Frontend — styles | New rule for `.class-header__identity` added |
| `ClassHeader.tsx` | Frontend — component | No change |

---

## 3. Data Flow

No data flow change. The identity fields are already rendered and wired to `useCharacterIdentity`. This change affects presentation only.

---

## 4. API Contract

No API changes.

---

## 5. Security Notes

No security implications. This is a CSS layout change with no user input surface changes and no trust boundary crossings.

---

## 6. Consistency Notes

Follows the established pattern for responsive grid adjustments in `App.css`. The existing `@media (max-width: 768px)` and `@media (max-width: 480px)` blocks (which govern `.character-sheet__columns` and `.traits-section__columns`) are the direct precedent. The new rules are added to those same blocks.

No ADR is required: no new external dependency, no new pattern, no API or data model change, no trade-off between competing approaches.
