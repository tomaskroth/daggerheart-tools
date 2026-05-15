# Design Specification — PBI-022: Damage thresholds as inline 2-input row in Damage and Health section

**PBI:** PBI-022
**Design Agent output date:** 2026-05-15
**Status:** Draft

---

## 1. Feature Summary

The three stacked damage threshold rows (Minor, Major, Severe — each with its own label and input) are replaced by a single inline row that reads: "Minor Damage | [input] | Major Damage | [input] | Severe Damage". Exactly two number inputs are present: one for the Minor-to-Major boundary and one for the Major-to-Severe boundary. Character state is reduced from three threshold fields to two.

---

## 2. Scope

**IN scope for this design:**
- Replacement of the three stacked `.damage-health-section__threshold-row` rows with one inline threshold row
- Inline layout: label → input → label → input → label
- Exactly two number inputs, independently editable
- Character state `damageThresholds` reduced from `{ minor, major, severe }` to `{ minor, major }`
- Hint text "Add your current level" retained above the inline row

**OUT of scope:**
- Changes to HP slots, stress slots, hope, gold, or any other part of the Damage & Health section
- Changes to any other character sheet section

---

## 3. Pages and Routes Affected

| Route | Page/Component | New or Modified |
|---|---|---|
| `/character-sheet` | `DamageHealthSection.tsx` | Modified — threshold rendering replaced |
| `/character-sheet` | `App.css` | Modified — new inline threshold row styles |
| `/character-sheet` | `CharacterContext.tsx` | Modified — `damageThresholds` state shape updated |
| `/character-sheet` | `character.ts` (types) | Modified — `DamageThresholds` type updated |
| `/character-sheet` | `useCharacterHealth.ts` | Modified — `setDamageThreshold` updated for two fields |

---

## 4. Component Inventory

| Component | Status | Location | Responsibility |
|---|---|---|---|
| `DamageHealthSection.tsx` | Modified | `src/features/character-sheet/components/DamageHealthSection.tsx` | Renders the new inline threshold row instead of three stacked rows |
| `App.css` | Modified | `src/App.css` | Adds `.damage-health-section__thresholds-inline` layout styles |
| `CharacterContext.tsx` | Modified | `src/features/character-sheet/context/CharacterContext.tsx` | Updates `damageThresholds` initial state and reducer to use `{ minor, major }` |
| `character.ts` | Modified | `src/features/character-sheet/types/character.ts` | Updates `DamageThresholds` type to `{ minor: number \| null; major: number \| null }` |
| `useCharacterHealth.ts` | Modified | `src/features/character-sheet/hooks/useCharacterHealth.ts` | Removes `severe` threshold from return value |

---

## 5. Layout and Visual Structure

### Damage & Health section — threshold area

**Before (current):**
```
┌──────────────────────────────────────────┐
│  Damage & Health                         │
│  Add your current level                  │
│                                          │
│  Minor Damage     [ 5 ]                  │
│  Major Damage     [ 12]                  │
│  Severe Damage    [ 20]                  │
│                                          │
│  HP   ■ ■ ■ □ □ □ □ □ □ □              │
│  ...                                     │
└──────────────────────────────────────────┘
```

**After (new):**
```
┌──────────────────────────────────────────┐
│  Damage & Health                         │
│  Add your current level                  │
│                                          │
│  Minor Damage  [ 5 ]  Major Damage  [12]  Severe Damage  │
│                                          │
│  HP   ■ ■ ■ □ □ □ □ □ □ □              │
│  ...                                     │
└──────────────────────────────────────────┘
```

**Inline row layout (`.damage-health-section__thresholds-inline`):**
- `display: flex`
- `flex-direction: row`
- `align-items: center`
- `flex-wrap: wrap`
- `gap: 0.5rem`
- Children: `<span>` labels alternating with `<input>` fields

**Element order in DOM:**
1. `<span>Minor Damage</span>`
2. `<input type="number" />` — Minor-to-Major threshold (id: `threshold-minor`)
3. `<span>Major Damage</span>`
4. `<input type="number" />` — Major-to-Severe threshold (id: `threshold-major`)
5. `<span>Severe Damage</span>`

**Input sizing:**
- Width: `4rem` (same as current `.damage-health-section__threshold-input`)
- `text-align: center`
- `type="number"` with `min={0}`

**Label styling:**
- Reuse `.damage-health-section__threshold-label` (existing class) on the `<span>` elements
- No change to font, colour, or size

**Hint text:**
- The existing `<p className="damage-health-section__hint">Add your current level</p>` is retained above the inline row, unchanged

**Sizing and spacing notes:**
- The inline row replaces exactly the space previously occupied by the three stacked rows — overall section height reduces since three rows become one
- `flex-wrap: wrap` ensures the row wraps gracefully if the section width is narrow (e.g., on mobile)

**Responsive behaviour:**
- On narrow viewports the inline row wraps; the three labels and two inputs remain readable as a wrapped sequence

---

## 6. Interaction Specification

### Edit the Minor-to-Major threshold

**Trigger:** User clicks the first input and types a number  
**Precondition:** Character sheet is displayed  
**Outcome:** `damageThresholds.minor` in character state is updated; input displays the typed value

### Edit the Major-to-Severe threshold

**Trigger:** User clicks the second input and types a number  
**Precondition:** Character sheet is displayed  
**Outcome:** `damageThresholds.major` in character state is updated; input displays the typed value

| State | Visual treatment |
|---|---|
| Default (empty) | Input displays blank or `0` per existing behaviour |
| Focused | Browser default focus ring |
| Filled | Number displays in centred input |

---

## 7. Copy and Labels

| Element | Copy | Notes |
|---|---|---|
| Label 1 | "Minor Damage" | Static `<span>` |
| Label 2 | "Major Damage" | Static `<span>` |
| Label 3 | "Severe Damage" | Static `<span>` |
| Hint text | "Add your current level" | Unchanged from current |

---

## 8. Accessibility Notes

- Each input needs an accessible label. Because the inputs sit inline between text labels, use `aria-label` on each input: first input `aria-label="Minor to Major damage threshold"`, second input `aria-label="Major to Severe damage threshold"`
- The `<span>` labels are decorative in the accessibility tree — no `for` attribute binding needed given the `aria-label` on the inputs
- Keyboard navigation: Tab moves between the two inputs in DOM order; standard number input behaviour applies

---

## 9. Design Decisions and Rationale

| Decision | Alternatives considered | Rationale |
|---|---|---|
| Remove `severe` from `DamageThresholds` state | Keep `severe` and just hide its input | The "Severe Damage" label at the end of the row is purely descriptive — it is the category with no upper bound. Storing a `severe` threshold value that is never displayed or edited is dead state. Removing it keeps the data model honest. |
| Retain existing input width (4rem) | Wider input for better usability | The inputs hold short numeric values (typically 1–30). 4rem is sufficient. Widening would break the compact inline layout. |
| Labels as `<span>` elements | `<label>` elements with `htmlFor` | Using `<label htmlFor>` for inline text between inputs creates confusing click targets (clicking the label focuses the associated input, which is unintuitive mid-sentence). `<span>` with `aria-label` on inputs is the correct accessible pattern for this layout. |
| `flex-wrap: wrap` on the inline row | Fixed single line (no wrap) | Prevents the row from overflowing the section at narrow widths without needing a horizontal scrollbar. |

---

## 10. Open Design Questions

No open design questions.

---

## 11. Scenario Traceability

| Scenario | Addressed by |
|---|---|
| Damage threshold row displays labels and inputs in the correct inline order | Section 5 — Inline row layout, element order |
| Damage threshold section contains exactly two input fields | Section 5 — Exactly two `<input>` elements |
| User can enter a value for the Minor-to-Major threshold | Section 6 — Edit Minor-to-Major threshold interaction |
| User can enter a value for the Major-to-Severe threshold | Section 6 — Edit Major-to-Severe threshold interaction |
| Threshold values are retained while interacting with other sheet fields | Section 5 — state managed in CharacterContext (no re-render resets) |
| Both threshold inputs are independently editable | Section 5 — Two separate inputs bound to separate state fields |
