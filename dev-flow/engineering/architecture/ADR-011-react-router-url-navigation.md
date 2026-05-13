# ADR-011: React Router URL Navigation

> **Status:** `Proposed`
> **Date:** 2026-05-13
> **Backlog item:** PBI-005
> **Decider:** Architecture Agent → 👤 Human approval required

---

## Context

`react-router-dom@^7.8.0` is already installed as a runtime dependency in `package.json`. However, the current `App.tsx` does not use it. URL navigation is implemented by reading `window.location.pathname` directly:

```typescript
const location = window.location.pathname;

useEffect(() => {
  const match = location.match(/^\/([^/]+)\/([^/]+)$/);
  if (match) {
    const itemName = decodeURIComponent(match[2].replace('.md', ''));
    // ... fetch item by name
  }
}, [location, serverUrl]);
```

This approach has several problems:

1. `window.location.pathname` is read once at component render time and stored in a `const`. It does not react to browser navigation (back/forward buttons, `pushState` calls). To respond to navigation changes, `window.addEventListener('popstate', ...)` would be required.
2. The `useEffect` dependency on `location` is always stable (it is captured at mount) — navigation to a new URL does not trigger the effect unless the page is reloaded.
3. The acceptance scenario "Navigating directly to an item URL displays that item" works only via a full page reload — it does not support client-side navigation to a URL.
4. The `react-router-dom` package is a dead dependency: it is installed and not used. This adds to the bundle size without benefit.

PBI-005 requires this to be made correct. The feature file scenario "Navigating directly to an item URL displays that item" must work: a user navigates directly to `/ancestries/Human.md` and the item detail view is displayed. This implies the router is active and the URL is parsed by a route definition, not by an ad-hoc `window.location` read.

React Router v7 ships two integration modes: the classic `BrowserRouter` + `useParams`/`useLocation` hooks pattern (available since v4), and the new Data Router (`createBrowserRouter`) pattern introduced in v6.4 with loaders and actions. This decision must choose between them.

---

## Decision Drivers

- **Primary:** The "direct URL navigation" scenario must work correctly — this requires the router to be active and parse the URL
- **Primary:** `react-router-dom` is already installed — using it is mandatory; removing it would require its own decision
- **Primary:** The pattern must be consistent with the `useSrdSearch` hook established in ADR-010: the hook fetches; the router provides the URL parameter
- **Secondary:** Minimal structural change — PBI-005 has no user-visible behaviour change requirement; the routing change must not introduce new UI patterns beyond what the feature file requires
- **Constraints:** The app currently has no `<Router>` wrapper — adding one requires changes to `index.tsx` or `App.tsx`; e2e tests navigate via Playwright `page.goto()` which performs a full-page navigation, so the router must handle direct URL loads

---

## Options Considered

### Option A: `BrowserRouter` + `useParams` (classic pattern)

Wrap the application in `<BrowserRouter>` in `index.tsx`. Define a route structure in `App.tsx` using React Router's `<Routes>` and `<Route>` components. Use `useParams()` to extract the item path from the URL. The URL navigation `useEffect` in `App.tsx` is replaced by a route match.

Route structure:
```
/                    → list view (search + item list)
/:type/:filename     → item detail view (parsed from URL)
```

The `useSrdSearch` hook (ADR-010) handles the search fetch. A separate `useItemBySlug` hook or an extension of `useSrdSearch` handles the initial load when arriving at `/:type/:filename` directly. The `selectedItem` state in `App.tsx` is replaced by a route-driven detail view — the item is fetched when the route matches, not stored in state after a click.

Navigation between list and detail views uses `useNavigate()` to push to `/:type/:filename` on card click, and navigate back to `/` on back button click. No `window.location` reads remain in any component.

**Pros:**
- Clean separation: the router owns URL state; hooks own server state; components own render state
- `useParams()` is reactive — navigating to a new URL re-renders the component and triggers the fetch effect
- Back/forward browser buttons work correctly with `BrowserRouter`
- Eliminates `window.location.pathname` reads from components
- `<BrowserRouter>` is the established React Router pattern — well-documented, well-understood
- Consistent with the "dumb components, smart hooks" architecture principle: the route match drives a hook call, not a component-level `fetch`

**Cons:**
- Requires a `<BrowserRouter>` wrapper in `index.tsx` — a small change to the entry point
- Item detail view state (currently `selectedItem` in `App.tsx`) must be refactored: either it remains as state (set on card click via `useNavigate` + fetched again on the detail route) or the detail route fetches independently. The simpler approach: clicking a card navigates to `/:type/:filename`; arriving at that route triggers the fetch. No state is passed via navigation — the item is always fetched by the route
- The current "click card → set `selectedItem` immediately → show detail" pattern becomes "click card → navigate → fetch → show detail" — a minor UX change (brief loading state on navigation). The feature file does not require instant render on click; it requires the detail view to display after click

**Security implications:**
- URL parameters from `useParams()` are strings extracted by the router — they must be decoded and validated before use in API calls (same as the current `decodeURIComponent` call)
- The `:filename` parameter includes `.md` suffixes which must be stripped before use as a search term — this logic moves into the hook/service layer where it can be tested

---

### Option B: React Router Data Router (`createBrowserRouter` with loaders)

Use `createBrowserRouter` to define routes with `loader` functions. The loader for `/:type/:filename` calls the API directly and returns the item data. The route component receives loaded data via `useLoaderData()`. No `useEffect` is needed for initial data fetching on direct navigation.

**Pros:**
- Loaders are the React Router v6.4+ idiomatic pattern for data fetching on navigation
- Loading state is managed by the router (`useNavigation().state === 'loading'`)
- Better separation — the loader is a pure function, not a hook side-effect

**Cons:**
- Significantly more complex setup: `RouterProvider`, `createBrowserRouter`, loader functions in route config
- Loaders are not hooks — they cannot use React context or the `serverUrl` prop without passing it through the router config, which requires a factory pattern
- The `serverUrl` is currently injected as a prop from `index.tsx` (via `ServerStatusGate`). With loaders, the URL must be available at router creation time, which requires either a module-level constant or a more complex setup
- Data Router patterns are not yet established in this codebase — this would be a larger architectural change than PBI-005's scope warrants
- PBI-005's goal is architectural cleanup, not adopting the newest React Router patterns

**Security implications:**
- Same URL parameter validation concerns as Option A
- Loaders are called by the router before render — an error in a loader produces a route error boundary, not a component error. This must be handled

---

### Option C: Keep `window.location.pathname` but fix the reactivity bug

Fix the current implementation by replacing `const location = window.location.pathname` with `useLocation()` from `react-router-dom`, wrapping the app in `<BrowserRouter>`, and updating the `useEffect` dependency to react to `location.pathname` changes.

**Pros:**
- Smallest change — the `useEffect` URL parsing logic is preserved

**Cons:**
- The URL parsing with `.match(/^\/([^/]+)\/([^/]+)$/)` remains in `App.tsx` — it belongs in a hook or the router layer
- `useLocation()` requires a `<BrowserRouter>` wrapper anyway — the same entry point change as Option A is required
- The route structure is implicit (inferred from the regex) rather than explicit (declared in `<Route>` components)
- Does not eliminate the `window.location` coupling — only replaces it with `useLocation()`, which is better but still leaves the routing logic in the component
- Partially addresses CLAUDE.md hard rule 4 (the fetch stays in `App.tsx` instead of moving to a hook) unless also refactored per ADR-010

**Security implications:**
- Same as Option A — URL parameter decoding and cleaning must be applied

---

## Decision

**We will use Option A: `BrowserRouter` + `useParams` + `useNavigate`.**

Option C fixes the reactivity bug but leaves routing logic in the component and does not establish a clean route structure. Option B is the modern Data Router approach but is disproportionate to PBI-005's scope and introduces a complex `serverUrl` injection problem. Option A establishes a clean, explicit route structure consistent with the architecture principles, is well within PBI-005's scope, and produces a fully reactive routing layer with minimal added complexity.

The item detail view is refactored as a route rather than a state toggle. Clicking a card calls `useNavigate()` to push `/:type/:filename`. The detail route mounts, calls `useSrdSearch` to fetch the item by slug, and renders `ItemDetail`. The back button calls `navigate(-1)` or navigates to `/`. This is a small UX change (brief load on click) that is transparent to the feature file scenarios.

---

## Architecture / Flow Diagram

```
index.tsx (entry point):
  <BrowserRouter>
    <ServerStatusGate serverUrl={SERVER_URL}>
      <App serverUrl={SERVER_URL} />
    </ServerStatusGate>
  </BrowserRouter>

App.tsx route structure:
  <Routes>
    <Route path="/" element={<ListPage />} />
    <Route path="/:type/:filename" element={<DetailPage />} />
  </Routes>

ListPage (inline in App.tsx or extracted):
  • useSrdTypes(serverUrl)   → TypeMenu
  • useSrdSearch(serverUrl)  → ItemList
  • on card click: navigate(`/${item.type}/${item.slug}.md`)

DetailPage (inline in App.tsx or extracted):
  • useParams() → { type, filename }
  • derive search term: decodeURIComponent(filename).replace('.md', '')
  • useSrdSearch(serverUrl).search(term) on mount
  • renders ItemDetail with first result
  • back button: navigate(-1)

Navigation flows:

  Direct URL load:
    Browser → /ancestries/Human.md
      → React Router matches /:type/:filename
      → DetailPage mounts → useParams() → filename = 'Human.md'
      → useSrdSearch.search('Human') → srdApi.searchItems()
      → ItemDetail rendered

  Card click (from list):
    User clicks ItemCard
      → navigate('/ancestries/Human.md')
      → DetailPage mounts (same as above)

  Back button:
    User clicks back
      → navigate(-1) or navigate('/')
      → ListPage rendered with previous search results (retained in hook state)
```

### Component changes summary

| Component | Change |
|---|---|
| `index.tsx` | Add `<BrowserRouter>` wrapper |
| `App.tsx` | Replace `window.location.pathname` block; add `<Routes>` + `<Route>` structure |
| `ItemList.tsx` | `onItemClick` callback triggers `navigate()` instead of `setSelectedItem()` — prop signature may simplify |
| `ItemDetail.tsx` | `onBack` calls `navigate(-1)`; receives item from route-driven fetch, not from parent state |
| `AppPage.ts` (e2e) | Add `navigateTo(path)` method for the "direct URL navigation" scenario |

---

## Consequences

### What becomes easier
- The URL is the single source of truth for which item is displayed — browser history, bookmarks, and deep links all work correctly
- The `selectedItem` state in `App.tsx` is eliminated — no risk of stale state from a previous search being shown on the detail page
- Each route can be independently tested in Vitest with a `MemoryRouter` wrapper
- The "direct URL navigation" e2e scenario is implementable with a simple `page.goto('/ancestries/Human.md')` call

### What becomes harder or riskier
- Clicking a card now triggers a navigation + fetch, introducing a brief loading state. The feature file does not forbid a loading state, but the e2e step must wait for the detail view to render, not just for the navigation
- The `AppPage.ts` page object must be extended with a `navigateTo(path)` method and a `waitForItemDetail()` method for the regression scenario
- `ItemList`'s `onItemClick: (item: SrdItem) => void` prop contract may change to `onItemClick: (item: SrdItem) => void` (unchanged) — the callback in `App.tsx` now calls `navigate()` instead of `setSelectedItem()`, but the prop type does not need to change

### Impact on existing system
- **API contracts:** No — same endpoints, same request shapes
- **Database migration:** No
- **Auth/authorisation behaviour:** No
- **New external dependencies:** No — `react-router-dom@^7.8.0` is already installed

---

## Security Considerations

- **Authentication/Authorisation:** Not applicable — all routes are public
- **Data sensitivity:** No sensitive data in URLs; SRD item slugs are public identifiers
- **Attack surface:** The `/:type/:filename` URL parameter is user-controllable (via address bar). The `filename` value is decoded via `decodeURIComponent()` and used as a search query body field (`{ q: term }`). It is not interpolated into a URL path or SQL query. The backend search endpoint performs a Lucene query — the term must be validated to prevent unexpected query syntax. This risk exists in the current code and is not introduced by this decision; it is flagged for the security agent to review
- **Threat mitigations:** URL parameters are strings; they cannot inject fetch calls or DOM elements. The `.replace('.md', '')` stripping happens before the value is used, reducing the surface slightly. The search query is sent as a JSON body field to the backend, where Lucene query parsing applies — this is within the existing security boundary

---

## Acceptance Scenarios Affected

- `PBI-005-frontend-architecture.feature` — Scenario: "Navigating directly to an item URL displays that item"
- `PBI-005-frontend-architecture.feature` — Scenario: "User can search and view an item from start to finish" (back button now uses `navigate(-1)`)
- `PBI-005-frontend-architecture.feature` — Scenario: "Abilities type items display recall cost and level" (item detail reached via navigation)

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

- React Router v7 ships bundled types (no `@types/react-router-dom` needed) — confirmed by ADR-008 type strategy table
- `<BrowserRouter>` requires the web server (Vite dev server in development; Vercel in production) to serve `index.html` for all paths under `/`. Vite's dev server does this by default. Vercel handles SPA routing via `vercel.json` rewrites — a `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` may be needed if not already present
- A `MemoryRouter` wrapper in Vitest tests (component tests for `App` and `DetailPage`) allows route-dependent components to be tested without a real browser history
- Related ADRs: [ADR-005](./ADR-005-playwright-cucumber-e2e.md), [ADR-009](./ADR-009-vite-migration.md), [ADR-010](./ADR-010-api-service-layer-and-hooks.md)
