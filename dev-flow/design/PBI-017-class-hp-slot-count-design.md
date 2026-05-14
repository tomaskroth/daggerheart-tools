# Design Specification — PBI-017: Class-specific HP slot count

**PBI:** PBI-017
**Design Agent output date:** 2026-05-14
**Status:** Draft

---

## 1. Feature Summary

When a class is selected on the character sheet, the number of solid-bordered HP boxes in the Damage & Health section updates to reflect that class's starting hit point count. The remaining boxes stay dashed. Previously this split was hardcoded; it now responds to the selected class.

---

## 2. Scope

**IN scope for this design:**
- The solid/dashed split of the 10 HP boxes in `DamageHealthSection` reacts to the selected class.
- When no class is selected the split falls back to 6 solid / 4 dashed (current behaviour, unchanged).

**OUT of scope:**
- Visual styling of the HP boxes — no changes to colours, borders, sizes, or marked state.
- Stress slot count (not class-dependent in these rules; remains hardcoded at 4).
- HP slots gained from levelling up (Tier advancement mechanics).
- Any change to the total number of HP slots (always 10).

---

## 3. Pages and Routes Affected

| Route | Page/Component | New or Modified |
|---|---|---|
| `/character-sheet` | `DamageHealthSection` | Modified — reads `hpSlotCount` from context instead of constant |

---

## 4. Component Inventory

| Component | Status | Location | Responsibility |
|---|---|---|---|
| `DamageHealthSection` | Modified | `src/features/character-sheet/components/DamageHealthSection.tsx` | Replaces hardcoded `HP_SOLID_COUNT = 6` with the class's `hpSlotCount` value read from context |
| `CharacterContext` / reducer | Modified | `src/features/character-sheet/context/CharacterContext.tsx` | Exposes `hpSolidCount` derived from the selected class's SRD data |
| `useCharacterHealth` | Modified | `src/features/character-sheet/hooks/useCharacterHealth.ts` | Surfaces `hpSolidCount` to the component |
| `ClassHeader` (or class-selection handler) | Modified | `src/features/character-sheet/components/ClassHeader.tsx` | On class selection, stores or derives `hpSlotCount` into context state |

No new components are required.

---

## 5. Layout and Visual Structure

No layout changes. The HP tracker row already renders 10 clickable slots. The only change is which slots are styled `--solid` vs `--dashed`. The visual appearance of each slot type is unchanged.

```
HP  [■][■][■][■][■][■][□][□][□][□]   ← Bard: 5 solid (■), 5 dashed (□) — was 6/4
HP  [■][■][■][■][■][■][■][□][□][□]   ← Guardian: 7 solid, 3 dashed — was 6/4
```

The transition from one split to another happens immediately on class selection, with no animation.

---

## 6. Interaction Specification

### Class selection changes HP solid count

**Trigger:** User selects a class from the class dropdown in `ClassHeader`.
**Precondition:** The HP tracker is visible.
**Outcome:** The solid/dashed split of the 10 HP boxes updates immediately to reflect the selected class's `hpSlotCount`.

**States to design for:**

| State | Visual treatment |
|---|---|
| No class selected | 6 solid / 4 dashed (default fallback — no change from current) |
| Class selected | `hpSlotCount` solid / `(10 - hpSlotCount)` dashed |
| Class changed to another class | Split updates immediately; marked (filled) slots are not cleared |
| Class data loading | Retain previous solid count until new class data resolves — no flicker |

**Note on marked slots and split changes:** If a player has, say, 8 HP slots marked and then switches from Guardian (7 solid) to Bard (5 solid), slots 6–8 remain marked — they just change from solid to dashed. The marking state is independent of the solid/dashed styling. This is correct game behaviour (the player's HP doesn't reset on class change).

---

## 7. Copy and Labels

No copy changes. All existing aria-labels, test IDs, and data attributes are unchanged in format. The `data-slot-type` attribute (`"solid"` or `"dashed"`) continues to reflect the actual slot type after the split updates.

---

## 8. Accessibility Notes

- No focus management changes required.
- `aria-label` for each HP slot already includes the slot number and marked state — no changes needed.
- `data-slot-type` attribute is preserved; test selectors and screen-reader behaviour are unaffected.

---

## 9. Design Decisions and Rationale

| Decision | Alternatives considered | Rationale |
|---|---|---|
| Derive `hpSolidCount` from the already-fetched class SrdItem rather than a separate API call | New endpoint `/api/srd/classes/{slug}/stats` | The class item is already in memory when a class is selected. A separate endpoint adds a network round-trip for data already available. |
| Fall back to 6 solid slots when no class is selected | Fall back to 5 (the most common value) or 0 | 6 matches the current visible default and avoids a visible change for users who haven't selected a class yet. |
| Do not reset marked HP slots when the class changes | Clear all marks on class change | Players may be mid-session when adjusting their class field. Clearing HP marks would be destructive and surprising. |

---

## 10. Open Design Questions

No open design questions.

---

## 11. Scenario Traceability

| Scenario | Addressed by |
|---|---|
| HP boxes reflect the selected class's starting hit point count | Section 6 — Class selection changes HP solid count |
| HP box borders update when a different class is selected | Section 6 — Class selection; Section 5 — immediate update behaviour |
| HP boxes show a default when no class is selected | Section 6 — No class selected state |
| Each class renders the correct number of solid HP boxes | Section 5 — Visual structure; values driven by backend data |
