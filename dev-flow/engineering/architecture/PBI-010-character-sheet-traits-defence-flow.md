# Flow Descriptor: PBI-010 — Traits & Defence Statistics

**Backlog item:** PBI-010
**Date:** 2026-05-14

---

## 1. What This Builds

The six trait score inputs (Agility, Strength, Finesse, Instinct, Presence, Knowledge), each with its three sub-skill labels displayed beneath. The Evasion field (defaulting to 10), Armor Score field, and six toggleable armor heart slots. All state managed via `CharacterContext` (ADR-012).

---

## 2. Component Map

| Component / File | New or Modified | Notes |
|---|---|---|
| `src/features/character-sheet/components/TraitsSection.tsx` | **New** | Six trait columns. Each column: score input + three sub-skill labels. Calls `useCharacterTraits()`. |
| `src/features/character-sheet/components/DefenceSection.tsx` | **New** | Evasion input, Armor Score input, 6 heart slot toggles. Also calls `useCharacterTraits()`. |
| `src/features/character-sheet/hooks/useCharacterTraits.ts` | **New** | Exposes trait scores, evasion, armorScore, armorSlots from context; dispatch helpers. |

---

## 3. Data Flow

No API calls. All interactions dispatch to `CharacterContext`.

```
User changes Presence score to +2:
  TraitsSection → dispatch SET_TRAIT { trait: 'presence', value: 2 }
    → reducer updates state.traits.presence = 2
      → TraitsSection re-renders showing "+2"

User marks armor slot 3:
  DefenceSection → dispatch TOGGLE_ARMOR_SLOT { payload: 2 } (0-indexed)
    → reducer flips state.armorSlots[2]
      → DefenceSection re-renders slot 3 as marked
```

---

## 4. API Contract

None — no API calls in this PBI.

---

## 5. Security Notes

- All inputs are numeric (trait scores, evasion, armor score) or boolean toggles (armor slots). No HTML rendering. No XSS surface.
- Sub-skill labels (Sprint, Leap, Maneuver, etc.) are hardcoded constants in the component — they are SRD-defined fixed values that do not change.

---

## 6. Consistency Notes

- Follows ADR-012 (CharacterContext + useReducer)
- Sub-skill labels are hardcoded TypeScript constants (not fetched from API) — they are fixed SRD text that never changes, making static constants correct and simpler than an API call
- Trait names follow the coding guideline for constants: defined as a `const TRAITS` array in a types file, not scattered through the component
