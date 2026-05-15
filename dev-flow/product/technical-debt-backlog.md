# Technical Debt Backlog

Items in this backlog are deferred improvements identified during architecture or implementation. They are not optional — they are obligations that were consciously deferred for scope reasons.

**Prioritization rule:** The Prioritization Agent treats debt items as follows:
- **P1 items** must be resolved before the next feature increment ships. They represent correctness or security gaps.
- **P2 items** are interleaved with feature work — at least one P2 item per increment unless the increment is trivially small.
- **P3 items** are scheduled opportunistically: when there is no higher-priority feature or P1/P2 debt to address.

Debt items are inputs to the Breakdown Agent and Prioritization Agent for every planning session. New debt identified during architecture or implementation is added here immediately, not deferred to a "future cleanup."

---

## Open Items

---

### TD-001: Add Vercel production SPA routing rewrite rule

**Source:** ADR-011 (React Router URL Navigation), Notes section
**Type:** Correctness
**Priority: P1**

**Problem:**
`BrowserRouter` requires the web server to serve `index.html` for every path under `/` — not just `/`. In development, Vite does this automatically. In production on Vercel, a direct request to `/ancestries/Human.md` will return a 404 unless a rewrite rule is configured. The `vercel.json` file may not have this rule.

**Benefit of addressing:**
The "Navigating directly to an item URL displays that item" scenario works in production, not just in local e2e tests. Without this fix, any shared or bookmarked link to an item detail page returns a 404 in production.

**Implementation note:**
Check whether `frontend/vercel.json` (or the root `vercel.json`) already contains:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
If not, add it. Verify by deploying and visiting a direct item URL.

---

### TD-002: Harden backend search endpoint against Lucene query injection

**Source:** ADR-011 (React Router URL Navigation), Security Considerations section
**Type:** Security
**Priority: P2**
**Deferral policy:** This is a backend-only item. It will not be picked up during frontend-only increments. It must be scheduled as the first item in the next increment that includes backend scope.

**Problem:**
The `q` field accepted by `POST /search` is passed to a Lucene query parser. A user-supplied value from the browser address bar (via `/:type/:filename` URL parameters) is decoded and sent as the `q` value. Lucene query syntax includes operators (`AND`, `OR`, `NOT`, wildcards, field specifiers, range queries) that could produce unexpected results or expose unintended index fields. This risk pre-dates PBI-005 — the URL now makes it more visible.

**Benefit of addressing:**
The search endpoint behaves predictably regardless of what a user types in the address bar or sends directly to the API. Prevents information leakage via Lucene field-name enumeration.

**Implementation note:**
Options include: escape Lucene special characters in the service layer before building the query; use a `SimpleQueryParser` with a restricted operator set; or validate the `q` field to a safe character allowlist. A backend ADR is likely needed. The Security Agent must be involved.

---

### TD-003: Implement real Playwright assertion for the XSS e2e scenario

**Source:** CLAUDE.md constraints, PBI-001 security baseline
**Type:** Security test coverage
**Priority: P2**

**Problem:**
The `@frontend @security` scenario "Item detail page does not execute script tags" has a stub step definition in `e2e/steps/appSteps.ts` (marked `// TODO PBI-001:`). The backend sanitisation via Jsoup `Safelist.basic()` (ADR-002) is in place, but the e2e test does not actually assert that script content is not executed in the browser. The scenario counts as passing because the stub does not fail — not because it has been verified.

**Benefit of addressing:**
The security control (Jsoup sanitisation) has end-to-end test coverage that would catch a regression if the sanitisation were removed or misconfigured. Without the real assertion, a future change to the ingest pipeline could silently break XSS protection.

**Implementation note:**
The step needs to: navigate to an item whose content contains a `<script>` tag; assert that the rendered DOM does not contain an executable `<script>` element or that a sentinel value (e.g. a JS `alert`) was not triggered. This requires either a test fixture item or a Playwright `page.evaluate()` check. The Security Agent should review the approach.

---

### TD-004: Migrate data-fetching hooks to React Query

**Source:** ADR-010 (API Service Layer and Custom Hooks), Decision and Consequences sections
**Type:** Architecture upgrade
**Priority: P3**

**Problem:**
`useSrdTypes` and `useSrdSearch` use `useState` + `useEffect` for data fetching. This pattern has no deduplication, caching, background refresh, or automatic retry. If two components independently call the same hook, two network requests fire. The architecture guidelines explicitly recommend React Query or SWR as the correct long-term pattern for server state.

**Benefit of addressing:**
Eliminates redundant network requests. Provides loading/error state management consistent across all data-fetching hooks. Enables background refresh and stale-while-revalidate behaviour if needed in future. The `src/services/srdApi.ts` service module is already structured as a query function layer — migration to React Query replaces only the hooks, not the service module or `App.tsx`.

**Implementation note:**
Introduce `@tanstack/react-query` as a runtime dependency. Wrap the app in `QueryClientProvider` in `index.tsx`. Replace `useSrdTypes` and `useSrdSearch` internals with `useQuery`. The service module contract (`fetchTypes`, `searchItems`) is unchanged. An ADR is required (it is a new runtime dependency and a change to the data-fetching architecture).

---

## Resolved Items

*(Items moved here when the associated PBI is complete and verified.)*

---

## How to Add a New Item

When architecture or implementation work identifies a deferred obligation, add it here immediately using this template:

```
### TD-XXX: [Title — imperative, concrete]

**Source:** [ADR-XXX / PBI-XXX / section that identified this]
**Type:** Correctness | Security | Security test coverage | Architecture upgrade | Performance | Reliability
**Priority: P1 | P2 | P3**

**Problem:**
[What is wrong or suboptimal now, and why it matters]

**Benefit of addressing:**
[What improves concretely when this item is done]

**Implementation note:**
[Any known approach, constraint, or prerequisite]
```

Assign the next available `TD-XXX` number. Update `CLAUDE.md`'s Current State section to reference the new item if it is P1 or P2.
