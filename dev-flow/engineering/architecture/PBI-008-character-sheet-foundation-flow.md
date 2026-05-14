# Flow Descriptor: PBI-008 — Character Sheet Page & Layout

**Backlog item:** PBI-008
**Date:** 2026-05-14

---

## 1. What This Builds

A new `/character-sheet` route in the React application that renders a two-column page layout matching the Daggerheart character sheet structure. This PBI delivers the scaffolding — route, layout, `CharacterContext` provider, and the empty header section with free-text identity inputs. All interactive SRD-backed sections (traits, weapons, armor, health trackers) are empty placeholders in this PBI, filled by PBI-009 through PBI-012.

Also resolves **TD-001**: adds the Vercel SPA rewrite rule to `vercel.json` so that direct URL access to `/character-sheet` works in production.

---

## 2. Component Map

| Component / File | New or Modified | Notes |
|---|---|---|
| `src/features/character-sheet/context/CharacterContext.tsx` | **New** | Context + useReducer (ADR-012). Full `CharacterState` and `CharacterAction` types defined here. |
| `src/features/character-sheet/components/CharacterSheetPage.tsx` | **New** | Route-level component. Provides `CharacterContext`. Renders two-column layout. |
| `src/features/character-sheet/components/ClassHeader.tsx` | **New** | Class badge, domain labels, Name/Pronouns/Heritage/Subclass/Level inputs. PBI-008: all free-text only. |
| `src/features/character-sheet/index.ts` | **New** | Public API — exports `CharacterSheetPage`. |
| `src/App.tsx` | **Modified** | Adds `/character-sheet` route pointing to `CharacterSheetPage`. Adds nav link. |
| `frontend/vercel.json` | **New or Modified** | Adds SPA rewrite rule: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` |

---

## 3. Data Flow

PBI-008 has minimal data flow — all inputs write to `CharacterContext` state. No API calls in this PBI.

```
User types in Name field
  → ClassHeader dispatches { type: 'SET_IDENTITY', payload: { name: '...' } }
    → CharacterContext reducer updates state.name
      → ClassHeader re-renders with new value (via useCharacterIdentity())
```

---

## 4. API Contract

No new or changed endpoints. The `/character-sheet` route is purely client-side.

---

## 5. Security Notes

- The route is public — no authentication required, consistent with the rest of the app
- No user data is sent to the backend in this PBI
- HTML rendering: this PBI renders only plain text inputs — no `dangerouslySetInnerHTML`

---

## 6. Consistency Notes

- Route added via React Router following the pattern established in ADR-011
- Feature-first structure follows the coding guidelines (`src/features/character-sheet/`)
- `CharacterContext` follows ADR-012 (new, approved in this increment)
- TD-001 resolution (`vercel.json`) follows the implementation note in the technical debt backlog
