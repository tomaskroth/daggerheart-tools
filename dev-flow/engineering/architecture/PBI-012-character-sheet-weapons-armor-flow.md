# Flow Descriptor: PBI-012 — Weapons, Armor & Inventory

**Backlog item:** PBI-012
**Date:** 2026-05-14

---

## 1. What This Builds

The right-column equipment sections:
- **Active Primary Weapon:** SRD-backed dropdown + auto-filled editable fields (Name, Trait & Range, Damage Dice & Type, Feature)
- **Active Secondary Weapon:** same pattern
- **Active Armor:** SRD-backed dropdown + auto-filled editable fields (Name, Base Thresholds, Base Score, Feature)
- **Inventory:** 6 free-text lines
- **Inventory Weapons (×2):** manual-entry fields only + Primary/Secondary role toggle

SRD data access follows ADR-013 (WEAPONS and ARMOR item types added to `srd.json`).

---

## 2. Component Map

| Component / File | New or Modified | Notes |
|---|---|---|
| `srd.json` | **Modified** | Weapon and armor entries added as WEAPONS/ARMOR type items (ADR-013). Implementation agent performs this extraction from existing CONTENTS HTML tables. |
| `src/features/character-sheet/hooks/useSrdWeapons.ts` | **New** | Fetches `type=WEAPONS`. Accepts optional `category` param (`'primary'` \| `'secondary'`), filters by `tags`. |
| `src/features/character-sheet/hooks/useSrdArmor.ts` | **New** | Fetches `type=ARMOR`. Returns `ArmorEntry[]`. |
| `src/services/srdApi.ts` | **Modified** | Add `fetchByType(serverUrl, type)` helper if not already added in PBI-009. |
| `src/features/character-sheet/components/ActiveWeaponsSection.tsx` | **Modified** | Stub from PBI-011 extended: adds Primary and Secondary weapon picker + editable field rows. |
| `src/features/character-sheet/components/WeaponPanel.tsx` | **New** | Reusable weapon entry display (dropdown + 4 fields). Used for Primary and Secondary. |
| `src/features/character-sheet/components/ActiveArmorSection.tsx` | **Modified** | Stub extended: adds armor picker + editable field row. |
| `src/features/character-sheet/components/InventorySection.tsx` | **Modified** | Stub extended: 6 text lines + 2 InventoryWeaponPanel components. |
| `src/features/character-sheet/components/InventoryWeaponPanel.tsx` | **New** | Manual fields + Primary/Secondary toggle. No SRD picker. |
| `src/features/character-sheet/hooks/useCharacterEquipment.ts` | **New** | Exposes primaryWeapon, secondaryWeapon, activeArmor, inventory, inventoryWeapons; dispatch helpers. |
| `src/features/character-sheet/types/equipment.ts` | **New** | `WeaponEntry`, `ArmorEntry`, `InventoryWeaponEntry` types (defined in ADR-013). |

---

## 3. Data Flow

```
On mount:
  useSrdWeapons('primary') → POST /api/search { types: ['WEAPONS'] }
    ← WEAPONS items tagged 'primary' → parsed to WeaponEntry[]
    → Primary weapon dropdown populated

  useSrdWeapons('secondary') → same endpoint, filtered by 'secondary' tag
  useSrdArmor() → POST /api/search { types: ['ARMOR'] }

User selects "Rapier" from Primary picker:
  WeaponPanel → parse selected SrdItem.content (JSON string) → WeaponEntry
    → dispatch SET_PRIMARY_WEAPON { payload: rapierEntry }
      → CharacterContext state.primaryWeapon = rapierEntry
        → WeaponPanel re-renders all fields pre-filled

User edits Primary Name field to "Silver Rapier":
  WeaponPanel → dispatch SET_PRIMARY_WEAPON { payload: { ...rapierEntry, name: 'Silver Rapier' } }
    → state.primaryWeapon.name = 'Silver Rapier'

User manually enters weapon not in SRD:
  WeaponPanel has no dropdown selection → all fields are blank and editable
  User types directly into Name, Trait & Range, Damage, Feature fields
    → each field dispatches SET_PRIMARY_WEAPON with the updated partial entry
```

---

## 4. API Contract

No new endpoints. New queries to existing `POST /api/search`:
- `{ types: ['WEAPONS'] }` — returns all weapon items; frontend filters by `tags` containing `'primary'` or `'secondary'`
- `{ types: ['ARMOR'] }` — returns all armor items

---

## 5. Security Notes

- Weapon/armor feature text from the SRD is plain text (stored as JSON string per ADR-013) — rendered as text content, not HTML. No `dangerouslySetInnerHTML` in this section.
- User can manually override all fields — these values are stored in `CharacterContext` (client-only). They are not sent to the backend in this iteration.
- Parsing `SrdItem.content` as JSON must be wrapped in try/catch to handle malformed data gracefully.

---

## 6. Consistency Notes

- Follows ADR-012 (CharacterContext + useReducer)
- Follows ADR-013 (WEAPONS/ARMOR items in srd.json, parsed from existing CONTENTS HTML tables)
- Follows ADR-010 (service + hook pattern for SRD data fetching)
- `WeaponPanel` is a reusable component used for both Primary and Secondary — it receives the weapon category and dispatch function as props, consistent with the "dumb components" guideline
- **Implementation agent action required for ADR-013:** Before writing frontend code, extract Tier 1 weapon and armor data from existing CONTENTS HTML in `srd.json` and add structured `WEAPONS`/`ARMOR` entries. Confirm the full list with the product owner if any items are ambiguous.
