# Daggerheart Tools — Claude Instructions

This project uses a structured agentic dev flow. **Before doing any work, read this file in full.** It tells you what to read next depending on what you've been asked to do.

---

## What This Project Is

A Daggerheart SRD compendium — React frontend + Spring Boot Java backend. Users browse and search tabletop RPG reference content. The backend uses H2 + Lucene for storage and full-text search.

```
daggerheart-tools/
├── CLAUDE.md               ← You are here
├── dev-flow/               ← The dev process (read before acting)
├── frontend/               ← React app (JavaScript → TypeScript migration in progress)
└── backend/                ← Spring Boot Java app
```

---

## The Dev Flow

All work on this project follows the process defined in `dev-flow/`. The short version:

1. **Product track** — increment is broken into PBIs → prioritised → acceptance scenarios written (`.feature` files in `dev-flow/product/`). Each PBI is classified as `minor`, `standard`, or `significant` — see `dev-flow/product/product-track-guidelines.md` for what each tier skips.
2. **Human checkpoint** — human approves scenarios
3. **Design** — Design Agent produces a Design Specification for any PBI with frontend scope (skipped for backend-only PBIs and `minor` tier PBIs)
4. **Human checkpoint** — human approves design before engineering begins
5. **Architecture** — ADRs and flow descriptors produced for each PBI (flow descriptors optional for `minor` tier)
6. **Human checkpoint** — human approves architecture
7. **Implementation** — Frontend and backend agents implement against the approved design and architecture
8. **Security review** — inline, two passes (design + implementation); `minor` tier uses a combined single pass
9. **Testing** — Test agent writes step definitions from `.feature` files
10. **Independent review** — separate agent reviews code against guidelines; `minor` tier uses a combined security+review pass
11. **Human checkpoint** — human reviews escalations only
12. **State update** — State Update Agent rewrites `Current State` in this file once all PBIs in the increment are complete
13. **Validation** — increment validated against original intent
14. **State update** — State Update Agent rewrites `Current State` in this file again after increment is accepted

**Read `dev-flow/HOW-TO-USE.md` if you need to understand how to trigger or navigate any stage.**

---

## Your Role in Each Session

Determine what you're being asked to do, then read the corresponding guideline file before proceeding. Do not act without reading the relevant file first.

| You are acting as… | Read this before starting |
|---|---|
| **Breakdown Agent** | `dev-flow/product/product-track-guidelines.md` |
| **Prioritization Agent** | `dev-flow/product/product-track-guidelines.md` |
| **Acceptance Scenario Agent** | `dev-flow/product/product-track-guidelines.md` + `dev-flow/product/acceptance-scenarios.md` |
| **UX/Design Agent** | `dev-flow/design/ux-design-guidelines.md` |
| **Architecture Agent** | `dev-flow/engineering/architecture/architecture-guidelines.md` |
| **Implementation Agent (backend)** | `dev-flow/engineering/guidelines/coding-guidelines.md` + relevant accepted ADRs in `dev-flow/engineering/architecture/` |
| **Implementation Agent (frontend)** | `dev-flow/engineering/guidelines/coding-guidelines.md` + relevant accepted ADRs in `dev-flow/engineering/architecture/` + approved Design Specification in `dev-flow/design/` |
| **Security Agent** | `dev-flow/engineering/security/security-agent-guidelines.md` |
| **Test Implementation Agent** | `dev-flow/engineering/testing/testing-strategy.md` + the `.feature` file(s) for the PBI |
| **Independent Review Agent** | `dev-flow/engineering/review/independent-review-guidelines.md` + `dev-flow/engineering/guidelines/coding-guidelines.md` |
| **Increment Validation Agent** | `dev-flow/engineering/validation/increment-validation-guidelines.md` |
| **State Update Agent** | `dev-flow/engineering/state/state-update-guidelines.md` |
| **Any agent making commits** | `dev-flow/engineering/version-control-guidelines.md` |

---

## Current State

**Active increment:** Theme-consistent select elements (PBI-024) — all PBIs complete

**Stage:** All PBIs complete — Increment validation in progress

**PBI status:**
- `PBI-024` ✅ Complete — styled select elements (dark/gold aesthetic, both light and dark modes, custom CSS arrow)

**Feature files:** All complete ✅
- `PBI-024-styled-select-elements.feature` ✅

**Accepted ADRs for this increment:** None (CSS-only change; flow descriptor only — see `dev-flow/engineering/architecture/PBI-024-styled-select-elements-flow.md`)

**Full PBI history, feature file list, and accepted ADR index:** `dev-flow/HISTORY.md`

**Key constraints:**
- Step-def method naming convention (`should_/when_`) is established as exempt for BDD step definition methods (applies only to `@Test` JUnit methods).
- `@SpringBootTest(RANDOM_PORT)` Cucumber context requires `@ActiveProfiles("dev")` to suppress `ProductionStartupGuard`.
- e2e `cucumber.js` must be run with CWD=`frontend/` (the `test:e2e` script handles this automatically via `start-server-and-test`).
- `APP_URL` env var overrides the default `http://localhost:3000` in `AppPage.ts`; `VITE_API_URL` overrides the production API base in `world.ts`.
- Playwright routes are LIFO (last registered = highest priority). `srd/types` must be registered after `srd/**` in `world.ts` to prevent the wildcard intercepting it.
- Character sheet: all 18 SUBCLASSES items in `srd.json` are tagged `["class:<slug>"]`; client-side filtering in `useSrdSubclasses` by `classSlug`.
- Character sheet: WEAPONS and ARMOR SRD items use HTML content (not JSON strings as originally specified in ADR-013 draft); `useSrdWeapons` and `useSrdArmor` parse via regex. ADR-013 amended and approved.
- Character sheet: `dangerouslySetInnerHTML` used only in `ClassFeatureSection` and `HopeSection` for backend-sanitised SRD content (ADR-002). The `extractHopeFeatureHtml` util carries a `⚠️ SECURITY` JSDoc.
- Character sheet: shared API URL constant lives in `src/features/character-sheet/constants.ts` — all five SRD hooks import `CHARACTER_SHEET_API_URL` from there.
- XSS e2e scenario (PBI-009 `@security @frontend`): real Playwright `page.on('dialog', ...)` assertion in place — TD-003 resolved.
- Slot gauges: `gaugeToggle(slots, index)` in `CharacterContext.tsx` handles fill-right/empty-right for HP, stress, hope, armor, and proficiency. Clicking slot N fills 0..N; clicking the last-filled slot empties it.
- AppPage.ts `clickSlot(testId)` takes a full test ID string; `areSlotsMarkedInRange(prefix, from, to)` builds IDs as `${prefix}-${i}`. Armor slots are 0-indexed in the DOM (`armor-slot-0` = slot 1); use `clickArmorSlot(n)` / `isArmorSlotMarked(n)` which handle the offset.
- Experience lines (PBI-019): each row has `data-testid="experience-line-{N}-name"` and `data-testid="experience-line-{N}-modifier"`. `AppPage.getExperienceLineCount()` counts `.experience-section__row` elements; `fillExperienceLine` / `getExperienceLineValue` target the `-name` input.
- HP solid/dashed split (PBI-017): `hpSolidCount` lives in `CharacterState` (default 6); set via `SET_IDENTITY` when class changes in `ClassHeader`. `useCharacterHealth` exposes it; `DamageHealthSection` uses it directly.
- Domain badges (PBI-018): `extractDomains` in `classContentParsers.ts` parses `<a>` tags from the HTML section between `DOMAINS:</strong>` and `<br`. Domain names come from link text, not plain text nodes.
- Nav (PBI-020): `isCompendiumOpen` state in `App.tsx`; open on all routes except `/character-sheet`; implemented via conditional rendering (DOM removal) rather than `display:none` — intentional deviation from design spec, documented in code comment.
- Character sheet layout (PBI-021): `ClassHeader` renders in `.character-sheet__identity-row`; `TraitsSection` renders in `.character-sheet__traits-row` — both are full-width wrapper divs above `.character-sheet__columns`, not inside the column grid. Traits internal grid is `repeat(6, 1fr)`; collapses to `repeat(3, 1fr)` at ≤768px and `repeat(2, 1fr)` at ≤480px.
- Damage thresholds (PBI-022): `DamageThresholds` type is `{ minor: number | null; major: number | null }` — `severe` field removed. Inline row has `data-testid="damage-thresholds-inline"`; inputs are `data-testid="threshold-minor"` and `data-testid="threshold-major"`.
- Identity bar (PBI-023): `.class-header__identity` grid is `repeat(3, 1fr)` at >768px, `repeat(2, 1fr)` at ≤768px, `1fr` at ≤480px. `AppPage.getIdentityGridColumnCount()` uses bounding-box row grouping (5px tolerance). `AppPage.getIdentityFieldsOnRow(n)` groups fields by y-position and returns labels for row n (1-indexed).
- Select elements (PBI-024): all character sheet selects use `appearance: none` + CSS `background-image` SVG chevron (no wrapper divs). `.character-sheet__section select` covers armor; `.class-header__field select` covers class/heritage/subclass; `.weapon-panel__select` has its own full rule (was previously unstyled). SVG data URIs use percent-encoded `%3C`/`%3E` for cross-browser compatibility. Light mode: white bg, `#2c2a33` text, `#d4b04f` border. Dark mode: `#18122b` bg, `#f3e9ff` text, `#a88b32` border.
- Version control: all work happens on `increment/<slug>` or `fix/PBI-XXX-<slug>` branches in the main working tree. No git worktrees (removed from guidelines 2026-05-14).

**Technical debt:** `dev-flow/product/technical-debt-backlog.md`
- `TD-001` ✅ Resolved — `frontend/vercel.json` SPA rewrite rule created in PBI-005
- `TD-002` P2 — Backend search endpoint Lucene query injection hardening — deferred to next backend increment; will not be picked up during frontend-only increments
- `TD-003` ✅ Resolved — Playwright XSS assertion implemented in PBI-009 step defs (`page.on('dialog', ...)`)
- `TD-004` P3 — Migrate data-fetching hooks to React Query

**Last updated:** 2026-05-15 — PBI-024 (styled select elements) passed independent review; increment ready for validation

---

## Hard Rules

These apply regardless of what you've been asked to do:

1. **Read before acting.** Always read the relevant guideline file for your role before writing any code or producing any document.
2. **The independent review agent is isolated.** If acting as the review agent, do not carry over context from the implementation session. Review cold against the guidelines and the feature files only.
3. **No business logic in controllers.** Backend controllers parse requests, delegate to services, format responses. Nothing else.
4. **No API calls in components.** Frontend components render. Hooks fetch. Services call the API.
5. **TypeScript only.** No new `.js` or `.jsx` files. All new frontend code is `.ts` or `.tsx`.
6. **Tests are not optional.** Every PBI must have passing step definitions for all its `@backend` and `@frontend` scenarios before it is considered done.
7. **ADRs before implementation.** Any decision that meets the ADR trigger criteria in `dev-flow/engineering/architecture/architecture-guidelines.md` must be documented and acknowledged before the implementation begins.
8. **Security agent runs twice.** Once at design time (after architecture, before implementation) and once after implementation (before independent review). Both passes are required for any PBI touching auth, endpoints, user input, or data persistence. `minor` tier PBIs use a single combined security+review pass — see `dev-flow/product/product-track-guidelines.md`.
9. **State Update Agent runs once per increment, not per PBI.** It runs after all PBIs in the increment pass independent review (on the increment branch), and again after the human accepts the increment (docs branch). Do not run it after every individual PBI. This is how the next session knows where to start.
10. **Nothing is ever committed directly to `main`.** All changes — code, ADRs, feature files, `CLAUDE.md`, dev-flow documentation — reach `main` through a branch and a pull request. See `dev-flow/engineering/version-control-guidelines.md` for branch naming conventions and the full branching model.
