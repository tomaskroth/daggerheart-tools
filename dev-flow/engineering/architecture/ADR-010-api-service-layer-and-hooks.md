# ADR-010: API Service Layer and Custom Hooks Pattern

> **Status:** `Proposed`
> **Date:** 2026-05-13
> **Backlog item:** PBI-005
> **Decider:** Architecture Agent → 👤 Human approval required

---

## Context

After PBI-004, `App.tsx` contains all API calls inline inside `useEffect` closures and `async` event handlers. Three distinct fetch operations are spread through the component:

1. `GET /srd/types` — on mount, to populate the `TypeMenu`
2. `POST /search` — via `handleSearch`, triggered by user text query
3. `POST /search` with `{ types: [type] }` — via `handleTypeClick`, triggered by type filter selection
4. `POST /search` with `{ q: itemName }` — via a `useEffect` watching `window.location.pathname`, for direct URL navigation

CLAUDE.md hard rule 4 states: "No API calls in components. Hooks fetch. Services call the API." This rule is not currently satisfied. PBI-005 must refactor `App.tsx` to comply.

The architecture guidelines additionally state: "Feature-first structure. Code is organised by feature, not by technical layer." and "Dumb components, smart hooks. Components render; hooks manage logic and state."

No API service module or custom data-fetching hook exists in the codebase today. This is a new pattern that must be documented before implementation.

The project does not currently use React Query or SWR. The feature file has no scenarios that require caching, background refresh, or stale-while-revalidate behaviour. The architecture guidelines note "Server state is not global state" and recommend a data-fetching library, but do not mandate one.

---

## Decision Drivers

- **Primary:** CLAUDE.md hard rule 4 — components must not call `fetch` directly
- **Primary:** Architecture guideline — dumb components, smart hooks; feature-first structure
- **Secondary:** The refactor must produce no user-visible behaviour changes (PBI-005 scope)
- **Secondary:** The pattern must be testable: hooks must be independently unit-testable; the service module must be mockable
- **Constraints:** No new runtime dependencies if the current state can be achieved with React's built-in `useState` + `useEffect`; avoid over-engineering for a single-feature app with three API endpoints

---

## Options Considered

### Option A: Typed service module + custom hooks (no new library)

Introduce two layers:

**Layer 1 — `src/services/srdApi.ts`**: A typed service module that owns all `fetch` calls. It exports named async functions (`searchItems`, `fetchTypes`) that accept typed parameters and return typed `Promise<T>` results. It knows the base URL and the HTTP contract. It does not touch React state.

**Layer 2 — `src/hooks/useSrdSearch.ts` and `src/hooks/useSrdTypes.ts`**: Custom hooks that call the service functions, manage `useState` for data/loading/error state, and return typed result objects. Components call these hooks and receive state; they never call `fetch` directly.

`App.tsx` is refactored to call hooks only. It receives typed state from the hooks and passes it to child components.

**Pros:**
- Satisfies CLAUDE.md hard rule 4 completely — zero `fetch` calls remain in any component
- No new runtime dependencies — uses React `useState` and `useEffect` only
- Service module is independently testable with `vi.fn()` mocks (Vitest, ADR-004)
- Hooks are independently testable with `renderHook()` from React Testing Library
- Clean separation: the service knows about HTTP; the hook knows about React state; the component knows about rendering
- Feature-first: `src/services/` and `src/hooks/` are small, cohesive modules
- Consistent with the architecture guidelines' "dumb components, smart hooks" principle
- The URL navigation logic (`window.location.pathname` → search) moves out of `App.tsx` into a hook or the router layer (addressed in ADR-011)

**Cons:**
- No built-in caching, deduplication, or background refresh — if two hooks trigger the same search simultaneously, two network requests fire
- Error handling must be manually implemented in each hook — no automatic retry
- If the app grows to have many data-fetching requirements, this pattern will need to be replaced with React Query or SWR (the architecture guidelines anticipate this)

**Security implications:**
- The service module is the single place where the backend URL is assembled — injection of unexpected path segments must be guarded (the existing code passes `q` as a JSON body field, not a URL parameter, which is appropriate)
- No credentials or auth tokens are involved in the current API calls

---

### Option B: React Query for server state

Introduce `@tanstack/react-query` as a runtime dependency. Define query keys and query functions. Wrap the app in `QueryClientProvider`. Replace `useState` + `useEffect` fetch patterns with `useQuery` and `useMutation` hooks.

**Pros:**
- Built-in caching, deduplication, background refresh, stale-while-revalidate
- Error and loading state handled automatically via `isLoading`, `isError`, `data` properties
- Consistent with the architecture guidelines' explicit recommendation ("React Query or SWR")

**Cons:**
- Adds a runtime dependency (`@tanstack/react-query`) for a three-endpoint API — over-engineered for current scope
- PBI-005's scope is "no user-visible behaviour changes" and "API layer extraction" — adding React Query changes the data-fetching semantics (caching, retries) which is scope expansion
- React Query's `QueryClientProvider` wrapper must be added to `index.tsx`, which changes the component tree
- Test setup requires `QueryClientProvider` in every component test that uses a query hook

**Security implications:**
- Same as Option A for API call handling
- React Query's cache stores server responses in memory — not a concern for public SRD content, but worth noting if the app ever handles user-specific data

---

### Option C: Leave fetch in `useEffect` but move to a context / reducer

Keep the fetch calls in `App.tsx` but wrap them in a `useReducer` dispatch pattern and/or a React context. This does not extract the API calls but does centralise state management.

**Pros:**
- No new files; state management is consolidated in one place

**Cons:**
- Directly violates CLAUDE.md hard rule 4 — components still call `fetch`
- Does not satisfy the architecture guideline or the PBI-005 refactor goal
- Context + reducer adds structural complexity without addressing the actual problem (API calls in components)

**Security implications:**
- Same as the current state — no improvement

---

## Decision

**We will use Option A: typed service module and custom hooks, no new library.**

Option C violates the hard rule. Option B is the right long-term choice (and the architecture guidelines explicitly point to it) but is scope expansion for PBI-005. Option A achieves full compliance with CLAUDE.md hard rule 4 and the architecture guidelines at zero runtime dependency cost, and it produces a service module layer that will be easy to replace with React Query in a future PBI if needed.

The architecture guidelines' "server state is not global state" and "data-fetching library" guidance is noted and accepted as a future upgrade path. A comment in `src/services/srdApi.ts` will document the intent to migrate to React Query when the data-fetching requirements grow.

---

## Architecture / Flow Diagram

```
Before (PBI-004 state):
  App.tsx
    ├── useEffect → fetch('/srd/types') → setTypes()
    ├── useEffect → fetch('/search', { q: itemName }) → setSelectedItem()
    ├── handleSearch → fetch('/search', { q }) → setItems()
    └── handleTypeClick → fetch('/search', { types }) → setItems()

After (PBI-005 state):
  src/
  ├── services/
  │   └── srdApi.ts
  │         ├── fetchTypes(serverUrl): Promise<string[]>
  │         └── searchItems(serverUrl, params: SearchParams): Promise<SearchResponse>
  │
  ├── hooks/
  │   ├── useSrdTypes.ts
  │   │     • calls srdApi.fetchTypes() on mount
  │   │     • returns { types: string[], loading: boolean, error: Error | null }
  │   └── useSrdSearch.ts
  │         • exposes search(query) and filterByType(type) functions
  │         • calls srdApi.searchItems() internally
  │         • returns { items: SrdItem[], selectedType: string | null, loading: boolean }
  │
  └── App.tsx  (refactored)
        ├── const { types } = useSrdTypes(serverUrl)
        ├── const { items, search, filterByType } = useSrdSearch(serverUrl)
        ├── [dark mode state remains in App — it is UI state, not server state]
        └── [selectedItem state remains in App — it is navigation state, not server state]

Data flow for a search:
  User types query → SearchBar onSearch → App.handleSearch(query)
    → useSrdSearch.search(query)
      → srdApi.searchItems(serverUrl, { q: query })
        → POST /search { q: query }
          ← SearchResponse { items, total }
      ← items[] returned to hook state
    ← App receives updated items via hook return value
  → ItemList re-renders with new items
```

### Module contracts

**`src/services/srdApi.ts`**

```typescript
export type SearchParams =
  | { q: string }
  | { types: string[] };

export async function fetchTypes(serverUrl: string): Promise<string[]>
export async function searchItems(serverUrl: string, params: SearchParams): Promise<SearchResponse>
```

**`src/hooks/useSrdTypes.ts`**

```typescript
export function useSrdTypes(serverUrl: string): {
  types: string[];
  loading: boolean;
  error: Error | null;
}
```

**`src/hooks/useSrdSearch.ts`**

```typescript
export function useSrdSearch(serverUrl: string): {
  items: SrdItem[];
  selectedType: string | null;
  loading: boolean;
  search: (query: string) => void;
  filterByType: (type: string) => void;
  clearSelection: () => void;
}
```

---

## Consequences

### What becomes easier
- Each service function can be mocked in Vitest tests with `vi.spyOn(srdApi, 'searchItems')`
- `App.tsx` shrinks significantly — it becomes a layout and wiring component
- Any future migration to React Query replaces only the hooks, not `App.tsx` or the service module
- The service module is the single source of truth for the backend API contract on the frontend side

### What becomes harder or riskier
- If two components independently call the same hook, two separate fetch requests fire — there is no deduplication. This is acceptable for the current single-page app structure where hooks are called only in `App.tsx`
- Error states from the hooks must be explicitly propagated to the UI — the current code uses `console.error` only; PBI-005 should maintain this minimum behaviour (no user-visible error UI is required by the feature file)

### Impact on existing system
- **API contracts:** No — the same three endpoints are called with the same request shapes
- **Database migration:** No
- **Auth/authorisation behaviour:** No
- **New external dependencies:** No

---

## Security Considerations

- **Authentication/Authorisation:** The API is unauthenticated (public SRD content); no credentials are handled
- **Data sensitivity:** No sensitive data. The `serverUrl` prop originates from `index.tsx` where it is hardcoded to the production URL — it is not user-controllable
- **Attack surface:** The service module assembles the full request URL by concatenating `serverUrl` with a fixed path (`/search`, `/srd/types`). The `serverUrl` is not user-supplied, so URL injection via this parameter is not a concern. Query parameters (`q`) are passed as JSON body fields, not URL segments — no path traversal risk
- **Threat mitigations:** All API responses pass through the typed `SearchResponse` / `string[]` deserialisation defined in `src/types/index.ts`. HTML content in `item.content` is rendered via `dangerouslySetInnerHTML` — the ADR-002 backend sanitisation is the primary control; the frontend rendering is unchanged by this refactor

---

## Acceptance Scenarios Affected

All PBI-005 scenarios exercise the refactored data-fetching path. The refactor is transparent to the user, so the same Playwright-visible outcomes apply:

- `PBI-005-frontend-architecture.feature` — all five scenarios

---

## 👤 Human Review Checklist

- [ ] The problem description matches my understanding of the intent
- [ ] At least two options were genuinely considered (not a rubber stamp)
- [ ] The chosen option's trade-offs are acceptable
- [ ] The flow diagram / sequence makes sense end-to-end
- [ ] The security section addresses auth, authorisation, and data sensitivity
- [ ] No existing API contracts are broken without explicit acknowledgment
- [ ] I am comfortable with this decision proceeding to implementation

**Decision:** `Approved` / `Rejected — [reason]` / `Needs revision — [what to revisit]`

---

## Notes

- The `icon?: string` dead prop in `ItemDetailProps` (noted in CLAUDE.md constraints) should be removed as part of this PBI's component cleanup
- Test files (`test-setup.js`, `SearchBar.test.js`, `ItemList.test.js`) must be migrated to `.ts` as part of PBI-005 — this follows ADR-006 (TypeScript only) and requires no new ADR
- Future upgrade path: when the app has more complex data requirements, replace `src/hooks/use*.ts` with React Query `useQuery` hooks while keeping `src/services/srdApi.ts` as the query function layer
- Related ADRs: [ADR-007](./ADR-007-cra-typescript-integration.md), [ADR-009](./ADR-009-vite-migration.md)
