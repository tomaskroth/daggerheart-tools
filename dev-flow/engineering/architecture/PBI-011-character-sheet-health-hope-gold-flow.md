# Flow Descriptor: PBI-011 — Health, Hope, Gold & Experience Trackers

**Backlog item:** PBI-011
**Date:** 2026-05-14

---

## 1. What This Builds

All the interactive tracker sections of the character sheet:
- **Damage & Health:** Minor/Major/Severe threshold inputs with "Add your current level" hint; 10 HP slots (6 solid + 4 dashed); 8 Stress slots (4 solid + 4 dashed)
- **Hope:** 6 toggleable diamond slots; Hope class feature text (populated from PBI-009's class selection)
- **Proficiency pips:** 6 pips in the Active Weapons header; pip 1 filled by default
- **Experience:** 5 free-text lines
- **Gold:** 9 Handfuls + 9 Bags + 1 Chest, each as toggleable slots

All state managed via `CharacterContext`. The Hope feature text comes from the class selected in PBI-009 — no additional API call needed (the class SrdItem is already in the hooks established in PBI-009).

---

## 2. Component Map

| Component / File | New or Modified | Notes |
|---|---|---|
| `src/features/character-sheet/components/DamageHealthSection.tsx` | **New** | Threshold inputs + HP slots + Stress slots. |
| `src/features/character-sheet/components/HopeSection.tsx` | **Modified** | Stub from PBI-009 extended: adds 6 diamond toggles; reads Hope feature text from selected class SrdItem. |
| `src/features/character-sheet/components/ExperienceSection.tsx` | **New** | 5 text input lines. |
| `src/features/character-sheet/components/GoldSection.tsx` | **New** | Handfuls/Bags/Chest slot toggles. |
| `src/features/character-sheet/hooks/useCharacterHealth.ts` | **New** | Exposes hpSlots, stressSlots, damageThresholds from context; dispatch helpers. |
| `src/features/character-sheet/hooks/useCharacterHope.ts` | **New** | Exposes hopeDiamonds, proficiencyPips, experience, gold; dispatch helpers. |
| `src/features/character-sheet/components/ActiveWeaponsSection.tsx` | **New** (stub) | Proficiency pip row rendered here. Full weapon pickers in PBI-012. |

---

## 3. Data Flow

No new API calls. Hope feature text comes from `useSrdClasses()` (established in PBI-009) — the selected class SrdItem contains the Hope feature as part of its content. The implementation agent must extract it from the class's `content` HTML.

```
User marks HP slot 4:
  DamageHealthSection → dispatch TOGGLE_HP_SLOT { payload: 3 }
    → reducer flips state.hpSlots[3]
      → DamageHealthSection re-renders slot 4 as marked

User marks 3 Handful gold slots:
  GoldSection → dispatch SET_GOLD { handfuls: 3 }
    → reducer updates state.gold.handfuls = 3
      → GoldSection re-renders 3 slots filled

Class selected (via PBI-009):
  HopeSection reads class SrdItem content → parses Hope feature text
    → renders as static text in the Hope section header
```

---

## 4. API Contract

None — no new API calls. The class SrdItem (already fetched in PBI-009) provides the Hope feature text.

---

## 5. Security Notes

- The Hope feature text is extracted from a class SrdItem's HTML content and rendered via `dangerouslySetInnerHTML`. Consistent with the class feature rendering in PBI-009 — Jsoup sanitisation (ADR-002) is the XSS control.
- All tracker interactions are toggle/numeric operations — no user HTML input.

---

## 6. Consistency Notes

- Follows ADR-012 (CharacterContext + useReducer)
- Gold tracker uses integer counts (0–9 for handfuls/bags, 0–1 for chest) stored in `CharacterState`, not boolean arrays, for easier serialisation in future persistence increment
- Proficiency pip 1 is initialised to `true` in the `initialCharacterState` — not hardcoded in the component
