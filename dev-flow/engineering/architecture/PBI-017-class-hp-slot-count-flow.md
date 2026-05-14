# Flow Descriptor — PBI-017: Class-specific HP slot count

**PBI:** PBI-017
**ADR:** ADR-014 (required — see that document for the full option analysis)
**Date:** 2026-05-14

---

## 1. What this builds

When a player selects a class on the character sheet, the solid/dashed split of the 10 HP boxes in the Damage & Health section updates to reflect that class's starting HP count (e.g. Bard = 5 solid, Guardian = 7 solid). The per-class count is parsed from the SRD content at backend startup and returned as `hpSlotCount` on each CLASSES item. The frontend replaces the hardcoded `HP_SOLID_COUNT = 6` constant with the value from the selected class.

---

## 2. Component map

| Component | Layer | Status | Change |
|---|---|---|---|
| `SrdItem.java` | Backend — model | Modified | Add `Integer hpSlotCount` nullable field |
| `DataLoader` / ingestion service | Backend — infrastructure | Modified | Parse `STARTING HIT POINTS: N` from CLASSES content; store in `hpSlotCount` |
| `SrdController` | Backend — API | Unchanged | Already serialises all `SrdItem` fields |
| `SrdItem` TypeScript type (`src/types/index.ts`) | Frontend — types | Modified | Add `hpSlotCount?: number` |
| `CharacterContext` / reducer | Frontend — state | Modified | Store `hpSolidCount` when class changes; fallback to 6 when null |
| `useCharacterHealth` | Frontend — hook | Modified | Expose `hpSolidCount` from context |
| `DamageHealthSection` | Frontend — component | Modified | Replace `HP_SOLID_COUNT` constant with `hpSolidCount` from hook |

---

## 3. Data flow

```mermaid
sequenceDiagram
    participant JSON as srd.json
    participant Loader as DataLoader
    participant DB as H2 (SrdItem)
    participant API as POST /api/search
    participant Hook as useSrdClasses
    participant Ctx as CharacterContext
    participant Comp as DamageHealthSection

    Note over JSON,DB: At startup
    JSON->>Loader: CLASSES item (content contains "STARTING HIT POINTS: 5")
    Loader->>Loader: regex extract → hpSlotCount = 5
    Loader->>DB: SrdItem { slug: "bard", hpSlotCount: 5, ... }

    Note over Hook,Comp: At runtime — user selects "Bard"
    Hook->>API: POST /api/search { types: ["CLASSES"] }
    API->>Hook: [ { slug: "bard", hpSlotCount: 5, ... }, ... ]
    Hook->>Ctx: user selects Bard → SET_IDENTITY { classSlug: "bard", hpSolidCount: 5 }
    Ctx->>Comp: hpSolidCount = 5
    Comp->>Comp: slots 0–4 → --solid; slots 5–9 → --dashed
```

---

## 4. API contract

**No new endpoint.** The existing `POST /api/search` response for CLASSES items gains one additive field:

```
POST /api/search
Request: { "types": ["CLASSES"] }  (unchanged)

Response item — new field only:
{
  "hpSlotCount": 5   // Integer, non-null for CLASSES; absent for all other types
}
```

This is a backward-compatible additive change. `@JsonInclude(NON_NULL)` ensures the field is omitted for all non-CLASSES items.

---

## 5. Security notes

- `POST /api/search` is a public, read-only endpoint. No change to authentication or authorisation.
- `hpSlotCount` is derived from backend-owned, Jsoup-sanitised content (ADR-002). No user input reaches the parser.
- No new trust boundaries introduced.

---

## 6. Consistency notes

- Follows the established nullable numeric field pattern on `SrdItem` (`level`, `recallCost`). See ADR-013 for precedent on extracting structured values from SRD content at ingestion time.
- Frontend state storage of `hpSolidCount` in `CharacterContext` follows ADR-012 (React Context + useReducer). The value is stored alongside `classSlug` in the identity portion of character state, derived from the selected class at the point of selection.
- The ingestion service must log a `WARN` for any CLASSES item where content parsing returns null, to surface ingestion errors during development.
