# Flow Descriptor: PBI-009 — Class, Heritage & Subclass with SRD Data

**Backlog item:** PBI-009
**Date:** 2026-05-14

---

## 1. What This Builds

Replaces the free-text identity inputs from PBI-008 with SRD-backed dropdowns for Class, Heritage (Community), and Subclass. Selecting a class dynamically populates: the two domain badges, the Class Feature section text, and the Hope section feature text — all fetched from the SRD. Subclasses are filtered to show only subclasses belonging to the selected class.

**Data prerequisite — class→subclass mapping:** The SRD `SUBCLASSES` items do not currently carry a parent-class reference. Before this PBI can be fully implemented, the product owner must provide the class→subclass mapping. The implementation agent will add a `class:<slug>` tag to each SUBCLASSES item in `srd.json` (e.g. `"tags": ["class:bard"]`). No schema change is required. The frontend filters client-side after fetching all SUBCLASSES.

---

## 2. Component Map

| Component / File | New or Modified | Notes |
|---|---|---|
| `src/features/character-sheet/hooks/useSrdClasses.ts` | **New** | Fetches `type=CLASSES` via `srdApi.searchItems`. Returns `SrdItem[]`. |
| `src/features/character-sheet/hooks/useSrdCommunities.ts` | **New** | Fetches `type=COMMUNITIES`. Returns `SrdItem[]`. |
| `src/features/character-sheet/hooks/useSrdSubclasses.ts` | **New** | Fetches `type=SUBCLASSES`. Accepts `classSlug` param; filters client-side by `class:<slug>` tag. |
| `src/services/srdApi.ts` | **Modified** | No new functions needed — `searchItems` is called with `{ types: ['CLASSES'] }` etc. Optionally add typed helper `fetchByType(type)`. |
| `src/features/character-sheet/components/ClassHeader.tsx` | **Modified** | Class dropdown (useSrdClasses), Heritage dropdown (useSrdCommunities), Subclass dropdown (useSrdSubclasses filtered by classSlug), domain badge display. |
| `src/features/character-sheet/components/ClassFeatureSection.tsx` | **New** | Renders class feature HTML from selected class SrdItem. |
| `src/features/character-sheet/components/HopeSection.tsx` | **New** (stub) | Renders class Hope feature text. Full tracker slots in PBI-011. |
| `srd.json` | **Modified** | `class:<slug>` tag added to each SUBCLASSES item. Provided by product owner. |

---

## 3. Data Flow

```
On mount:
  useSrdClasses() → POST /api/search { types: ['CLASSES'] }
    ← SrdItem[] → populates Class dropdown

User selects "Bard":
  ClassHeader dispatches SET_IDENTITY { classSlug: 'bard' }
    → CharacterContext state.classSlug = 'bard'
    → useSrdSubclasses('bard') re-fetches filtered list
        → POST /api/search { types: ['SUBCLASSES'] }
          ← all SUBCLASSES → filtered client-side by tag 'class:bard'
          → Subclass dropdown repopulated
    → ClassFeatureSection reads SrdItem for 'bard' from cache
        → renders item.content (HTML) via dangerouslySetInnerHTML
    → HopeSection reads bard's Hope feature text from SrdItem

User changes class to "Druid":
  Dispatches SET_IDENTITY { classSlug: 'druid', subclassSlug: null }
    → Subclass dropdown clears and repopulates with Druid subclasses
    → ClassFeatureSection and HopeSection update
```

---

## 4. API Contract

No new endpoints. Existing `POST /api/search` called with:
- `{ types: ['CLASSES'] }` — returns all class items
- `{ types: ['COMMUNITIES'] }` — returns all community/heritage items
- `{ types: ['SUBCLASSES'] }` — returns all subclass items (filtered client-side)

---

## 5. Security Notes

- Class feature text from the SRD is rendered via `dangerouslySetInnerHTML`. This is consistent with the existing item detail view. The backend Jsoup sanitisation (ADR-002) is the primary XSS control; no additional frontend sanitisation is required beyond what is already in place.
- No user-provided content is rendered as HTML — only SRD content from the backend

---

## 6. Consistency Notes

- Hook pattern (useSrdClasses, useSrdCommunities, useSrdSubclasses) follows ADR-010 exactly
- Client-side tag filtering for subclasses is the agreed approach (see PBI-009 feature file note). No new backend endpoint required.
- `class:<slug>` tag convention on SUBCLASSES items is a new data convention — documented in this flow descriptor as the canonical reference
- **Implementation agent action required:** Before coding begins, request the class→subclass mapping from the product owner and update `srd.json` with `class:<slug>` tags
