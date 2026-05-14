# Flow Descriptor — PBI-019: Experience name and modifier fields

**PBI:** PBI-019
**ADR:** None required — follows established ADR-012 pattern
**Date:** 2026-05-14

---

## 1. What this builds

Splits each of the 5 experience rows in the character sheet's Experience section into two inputs: a free-text name field and a numeric modifier field (styled like the trait score inputs). The character state model is updated from `string[]` to `Array<{name: string; modifier: number | null}>`. No backend changes.

---

## 2. Component map

| Component | Layer | Status | Change |
|---|---|---|---|
| `character.ts` | Frontend — types | Modified | `experience: string[]` → `experience: Array<{name: string; modifier: number \| null}>` |
| `CharacterContext.tsx` | Frontend — state | Modified | Initial state updated; reducer handles separate `name`/`modifier` fields per row |
| `useCharacterHope.ts` | Frontend — hook | Modified | `setExperience(index, value)` replaced by `setExperienceName(index, value: string)` and `setExperienceModifier(index, value: number \| null)` |
| `ExperienceSection.tsx` | Frontend — component | Modified | Each row renders a `type="text"` name input and a `type="number"` modifier input side-by-side |

---

## 3. Data flow

No server interaction. All state is local to `CharacterContext`.

```
User types in name field [row N]
  → ExperienceSection: setExperienceName(N, value)
  → useCharacterHope: dispatch SET_EXPERIENCE_NAME { index: N, value }
  → reducer: experience[N].name = value
  → re-render: name input reflects new value; modifier input unchanged

User types in modifier field [row N]
  → ExperienceSection: setExperienceModifier(N, parsedInt)
  → useCharacterHope: dispatch SET_EXPERIENCE_MODIFIER { index: N, value }
  → reducer: experience[N].modifier = value  (null if input is empty/NaN)
  → re-render: modifier input reflects new value; name input unchanged
```

---

## 4. API contract

No API changes. Experience data is not persisted to the backend.

---

## 5. Security notes

Both fields are plain local form inputs. The modifier field uses `type="number"` which the browser constrains to numeric input. No user-supplied data crosses a trust boundary. No security impact.

---

## 6. Consistency notes

- Follows ADR-012 (React Context + useReducer) exactly: new action types `SET_EXPERIENCE_NAME` and `SET_EXPERIENCE_MODIFIER` are added to the existing reducer.
- Modifier field uses `parseInt` with `null` fallback — identical to the pattern used in `TraitsSection` (`handleTraitChange`) and `DamageHealthSection` (`handleThresholdChange`).
- The modifier field reuses `traits-section__score-input` CSS class (or a dedicated `experience-section__modifier-input` class with matching dimensions) per the approved Design Specification (PBI-019).
- No new patterns, no new dependencies, no new components.
