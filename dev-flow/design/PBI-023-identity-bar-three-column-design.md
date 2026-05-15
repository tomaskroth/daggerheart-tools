# Design Specification — PBI-023: Compact identity bar — three fields per row

**PBI:** PBI-023
**Design Agent output date:** 2026-05-15
**Status:** Draft

---

## 1. Feature Summary

The six character identity fields (Name, Pronouns, Class, Heritage, Subclass, Level) currently occupy three rows of two fields. They will instead occupy two rows of three fields, reducing the vertical footprint of the identity bar without changing any field content, labels, or interactions.

---

## 2. Scope

**IN scope for this design:**
- Change the identity grid from two columns to three columns on wide viewports.
- Add responsive breakpoints: two columns at ≤768 px, one column at ≤480 px.

**OUT of scope:**
- Field order, labels, input types, or placeholder text.
- The domain badges row below the identity grid.
- Dark mode colour changes.
- Any other character sheet section.

---

## 3. Pages and Routes Affected

| Route | Page/Component | New or Modified |
|---|---|---|
| `/character-sheet` | `ClassHeader` | Modified — CSS only |

---

## 4. Component Inventory

| Component | Status | Location | Responsibility |
|---|---|---|---|
| `ClassHeader` | Modified (CSS only) | `src/features/character-sheet/components/ClassHeader.tsx` | No JSX changes. The `.class-header__identity` CSS class receives updated `grid-template-columns`. |

---

## 5. Layout and Visual Structure

### Identity bar — wide viewport (>768 px)

```
┌──────────────────────────────────────────────────────────────┐
│  Name               │  Pronouns           │  Class           │
│  [_______________]  │  [_______________]  │  [▼ Select    ]  │
├──────────────────────────────────────────────────────────────┤
│  Heritage           │  Subclass           │  Level           │
│  [▼ Select       ]  │  [▼ Select       ]  │  [__]            │
└──────────────────────────────────────────────────────────────┘
```

**Grid:** `repeat(3, 1fr)` — equal-width columns, existing `gap: 0.75rem` unchanged.

### Identity bar — tablet viewport (≤768 px)

```
┌──────────────────────────────────────┐
│  Name               │  Pronouns       │
│  [_______________]  │  [___________]  │
├──────────────────────────────────────┤
│  Class              │  Heritage       │
│  [▼ Select       ]  │  [▼ Select  ]   │
├──────────────────────────────────────┤
│  Subclass           │  Level          │
│  [▼ Select       ]  │  [__]           │
└──────────────────────────────────────┘
```

**Grid:** `repeat(2, 1fr)` — three rows of two.

### Identity bar — small mobile viewport (≤480 px)

```
┌────────────────────────┐
│  Name                  │
│  [__________________]  │
├────────────────────────┤
│  Pronouns              │
│  [__________________]  │
│  … (one per row)       │
└────────────────────────┘
```

**Grid:** `1fr` — single column, six rows.

**Sizing and spacing notes:**
- Gap remains `0.75rem` at all breakpoints — no change.
- Level input remains narrow (it is a number field); the grid column gives it the same allocated space as other fields, which is fine — the input itself is narrower than the column.

**Responsive behaviour:**
- >768 px → `repeat(3, 1fr)`
- ≤768 px → `repeat(2, 1fr)`
- ≤480 px → `1fr`

---

## 6. Interaction Specification

No new interactions. All existing field interactions (text input, dropdown selection, number input) are unchanged. This design only changes the spatial arrangement.

---

## 7. Copy and Labels

No changes to any copy or labels.

---

## 8. Accessibility Notes

- Focus order follows DOM order, which matches the visual left-to-right, top-to-bottom reading order in all three grid states. No focus management changes needed.
- No new ARIA labels required.
- No new colours introduced.

---

## 9. Design Decisions and Rationale

| Decision | Alternatives considered | Rationale |
|---|---|---|
| Collapse to 2 cols at ≤768 px (not 1 col) | 1 col at ≤768 px | Consistent with the traits section behaviour (`repeat(3, 1fr)` → `repeat(3, 1fr)` at ≤768 px then narrower). Two columns at tablet is readable without wasting space. |
| Collapse to 1 col at ≤480 px | Staying at 2 cols | At ≤480 px the fields would be too narrow for readable dropdown labels; single column is the correct choice. Human confirmed this preference. |
| No change to field order | Reorder fields for the 3-col layout | Field order (Name, Pronouns, Class, Heritage, Subclass, Level) is established and familiar. Reordering would break the acceptance scenario for field order. |

---

## 10. Open Design Questions

No open design questions.

---

## 11. Scenario Traceability

| Scenario | Addressed by |
|---|---|
| "Identity fields render in three columns on a wide viewport" | Section 5 — wide viewport layout |
| "Field order is preserved in the three-column layout" | Section 5 — field order is left-to-right DOM order; Section 9 — no reordering decision |
| "Identity grid collapses to two columns on a tablet viewport" | Section 5 — tablet layout; responsive behaviour notes |
| "Identity grid collapses to one column on a small mobile viewport" | Section 5 — small mobile layout; responsive behaviour notes |
| "All six identity fields remain visible and operable after layout change" | Section 4 — no JSX changes; Section 6 — interactions unchanged |
