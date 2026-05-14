# Design Specification — PBI-019: Experience name and modifier fields

**PBI:** PBI-019
**Design Agent output date:** 2026-05-14
**Status:** Draft

---

## 1. Feature Summary

Each of the 5 experience rows on the character sheet gains a second input field for the modifier (e.g. 2 or −1). Players can record a structured entry like "Charlatan" / 2 in the same row, matching how experiences are referenced during play.

---

## 2. Scope

**IN scope for this design:**
- Each experience row split into two fields: name (free text, wider) and modifier (numeric, narrow, styled like trait score inputs).
- State model updated from `string[]` to `Array<{name: string; modifier: number | null}>`.

**OUT of scope:**
- Validation or formatting enforcement beyond numeric type.
- Auto-calculation or aggregation of modifiers.
- Any change to the number of experience rows (still 5).
- Changes to any other section of the character sheet.

---

## 3. Pages and Routes Affected

| Route | Page/Component | New or Modified |
|---|---|---|
| `/character-sheet` | `ExperienceSection` | Modified — each row gains a numeric modifier input |

---

## 4. Component Inventory

| Component | Status | Location | Responsibility |
|---|---|---|---|
| `ExperienceSection` | Modified | `src/features/character-sheet/components/ExperienceSection.tsx` | Renders two inputs per row instead of one |
| `CharacterContext` / reducer | Modified | `src/features/character-sheet/context/CharacterContext.tsx` | State shape changes to `Array<{name: string; modifier: number | null}>` |
| `useCharacterHope` | Modified | `src/features/character-sheet/hooks/useCharacterHope.ts` | `setExperienceName(index, value)` and `setExperienceModifier(index, value)` replace the single `setExperience` |
| `character.ts` types | Modified | `src/features/character-sheet/types/character.ts` | `experience` field updated to new shape |

No new components are required.

---

## 5. Layout and Visual Structure

### Experience row — current

```
┌─────────────────────────────────────────┐
│  [Name / description text input       ] │
└─────────────────────────────────────────┘
```

### Experience row — new

```
┌──────────────────────────────────┬──────┐
│  [Name / description text input] │ [ 2] │
└──────────────────────────────────┴──────┘
```

The two inputs sit in a single row using flexbox (`flex-direction: row`). The name field takes the majority of the available width; the modifier field is a fixed narrow width matching the `traits-section__score-input` width (the trait score inputs established in PBI-010).

The 5 rows stack vertically as before.

**Sizing and spacing notes:**
- Name field: `flex: 1` (takes remaining space after modifier).
- Modifier field: same fixed width as `traits-section__score-input` — reuses that CSS class directly, or a dedicated `experience-section__modifier-input` class that matches its dimensions.
- Gap between name and modifier: uses the same `gap` value as other inline field pairs on the sheet.
- Row wrapper: `display: flex; align-items: center`.

**Responsive behaviour:**
- No responsive breakpoints required; the character sheet has a fixed-width layout.

---

## 6. Interaction Specification

### Entering an experience name

**Trigger:** User types in the name field of any experience row.
**Precondition:** Character sheet is open.
**Outcome:** Name field updates; modifier field in the same row is unaffected.

### Entering an experience modifier

**Trigger:** User types an integer (positive or negative) in the modifier field.
**Precondition:** Character sheet is open.
**Outcome:** Modifier field updates to the entered number. Non-numeric input is ignored (native `type="number"` behaviour). Name field in the same row is unaffected.

**States to design for:**

| State | Visual treatment |
|---|---|
| Empty (initial) | Both fields show empty — consistent with how trait score inputs appear when blank |
| Name entered, modifier empty | Name field shows text; modifier field is blank |
| Both filled | Both fields show their respective values |

No loading, error, or success states — both fields are local form inputs.

---

## 7. Copy and Labels

| Element | Copy | Notes |
|---|---|---|
| Name field placeholder | (none) | Consistent with other text inputs on the sheet |
| Modifier field placeholder | (none) | Consistent with trait score inputs which have no placeholder |
| Name field aria-label | `"Experience line {N} name"` | e.g. "Experience line 1 name" |
| Modifier field aria-label | `"Experience line {N} modifier"` | e.g. "Experience line 1 modifier" |
| Name field data-testid | `"experience-line-{N}-name"` | e.g. "experience-line-1-name" |
| Modifier field data-testid | `"experience-line-{N}-modifier"` | e.g. "experience-line-1-modifier" |

---

## 8. Accessibility Notes

- Both fields in each row are separately labelled with aria-labels that distinguish name from modifier.
- Tab order follows reading order: name field row 1 → modifier field row 1 → name field row 2 → modifier field row 2 → etc.
- `type="number"` provides native browser spin controls; these are acceptable for a numeric modifier field.
- No focus management changes required on interaction.

---

## 9. Design Decisions and Rationale

| Decision | Alternatives considered | Rationale |
|---|---|---|
| Modifier field is `type="number"` styled like trait score inputs | `type="text"` to allow formats like "+1d6" | User confirmed modifiers are always numeric (positive or negative integers). Using `type="number"` with the established trait input style maintains visual consistency and correctly constrains the field to its intended values. |
| Modifier state is `number | null` (not `string`) | `string` with parseInt on use | Matches the existing pattern for numeric character fields (`traits`, `damageThresholds`). `null` represents an empty/unset field, consistent with `traits[key] ?? ''` rendering pattern. |
| No placeholder text on either field | Placeholder like "Name" / "0" | The existing experience inputs have no placeholder, and trait score inputs have no placeholder. Adding one would be inconsistent. |
| Fixed narrow width matching trait score input | Auto-width or percentage | Reuses the established dimension, keeps the column visually aligned across all 5 rows, and constrains the field to its intended use. |
| Single flex row per entry, no label above | Label row above inputs | The sheet uses inline patterns for multi-field rows (weapon name/range). No other section adds a label row above inputs. |

---

## 10. Open Design Questions

No open design questions.

---

## 11. Scenario Traceability

| Scenario | Addressed by |
|---|---|
| Each experience line shows a name field and a modifier field | Section 5 — Layout; Section 4 — Component inventory |
| Player can enter an experience name and modifier | Section 6 — Entering name / modifier interactions |
| Name and modifier fields are independent across experience lines | Section 6 — both interactions; state is per-row |
| Modifier field accepts non-numeric formats | N/A — superseded by user confirmation that modifier is always numeric; `type="number"` is correct |
| Experience fields are empty on initial load | Section 6 — Empty state |
