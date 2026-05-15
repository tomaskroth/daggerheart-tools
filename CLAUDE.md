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

1. **Product track** — increment is broken into PBIs → prioritised → acceptance scenarios written (`.feature` files in `dev-flow/product/`)
2. **Human checkpoint** — human approves scenarios
3. **Design** — Design Agent produces a Design Specification for any PBI with frontend scope (skipped for backend-only PBIs)
4. **Human checkpoint** — human approves design before engineering begins
5. **Architecture** — ADRs and flow descriptors produced for each PBI
6. **Human checkpoint** — human approves architecture
7. **Implementation** — Frontend and backend agents implement against the approved design and architecture
8. **Security review** — inline, two passes (design + implementation)
9. **Testing** — Test agent writes step definitions from `.feature` files
10. **Independent review** — separate agent reviews code against guidelines
11. **Human checkpoint** — human reviews escalations only
12. **State update** — State Update Agent rewrites `Current State` in this file
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

**Active increment:** Identity bar compact layout — PBI-023 complete, awaiting validation

**Stage:** All PBIs complete — Increment validation in progress

**Completed increments:**
- Foundation & compendium (PBI-001–012) ✅
- Character sheet polish (PBI-013–016) ✅
- Character sheet data (PBI-017–019) ✅
- UI consolidation (PBI-020–022) ✅ — accepted 2026-05-15

**PBI status:**
- `PBI-001` ✅ Complete
- `PBI-002` ✅ Complete
- `PBI-003` ✅ Complete
- `PBI-004` ✅ Complete
- `PBI-005` ✅ Complete
- `PBI-006` ✅ Complete
- `PBI-007` ✅ Complete
- `PBI-008` ✅ Complete
- `PBI-009` ✅ Complete
- `PBI-010` ✅ Complete
- `PBI-011` ✅ Complete
- `PBI-012` ✅ Complete
- `PBI-013` ✅ Complete — character sheet styles and styled nav link
- `PBI-014` ✅ Complete — trait score input width widened to prevent clipping
- `PBI-015` ✅ Complete — slot trackers fill/empty as sequential gauges via `gaugeToggle`
- `PBI-016` ✅ Complete — Class Feature section moved below two-column grid for full width
- `PBI-017` ✅ Complete — backend parses `STARTING HIT POINTS` at ingestion into `hpSlotCount`; frontend wires `hpSolidCount` through context into `DamageHealthSection`
- `PBI-018` ✅ Complete — `extractDomains` fixed to capture `<a>` link text instead of stopping at first HTML tag
- `PBI-019` ✅ Complete — experience lines split into separate name (text) and modifier (number) fields; `ExperienceEntry` type, reducer, hook, component, and CSS updated
- `PBI-020` ✅ Complete — nav restructured into primary row (Compendium + Character Sheet buttons with diamond decorations) and secondary row (SRD category links); route-aware open/closed state
- `PBI-021` ✅ Complete — character sheet identity row (`ClassHeader`) and traits row (`TraitsSection`) moved to full-width rows above the two-column grid; traits grid changed to `repeat(6, 1fr)`
- `PBI-022` ✅ Complete — damage thresholds rendered as inline single row with two inputs; `severe` field removed from `DamageThresholds` state
- `PBI-023` ✅ Complete — identity bar grid changed from `1fr 1fr` to `repeat(3, 1fr)`; responsive overrides: 2 cols at ≤768px, 1 col at ≤480px

**Feature files:** All complete ✅ (`dev-flow/product/`)
- `PBI-001-security-baseline.feature` ✅
- `PBI-002-backend-service-layer.feature` ✅
- `PBI-003-backend-test-infrastructure.feature` ✅
- `PBI-004-frontend-typescript-migration.feature` ✅
- `PBI-005-frontend-architecture.feature` ✅
- `PBI-006-frontend-test-infrastructure.feature` ✅
- `PBI-007-multiword-item-navigation.feature` ✅
- `PBI-008-character-sheet-foundation.feature` ✅
- `PBI-009-character-sheet-class-identity.feature` ✅
- `PBI-010-character-sheet-traits-defence.feature` ✅
- `PBI-011-character-sheet-health-hope-gold.feature` ✅
- `PBI-012-character-sheet-weapons-armor.feature` ✅
- `PBI-013-character-sheet-styles.feature` ✅
- `PBI-014-trait-input-width.feature` ✅
- `PBI-015-slot-tracker-gauge-behaviour.feature` ✅
- `PBI-016-class-feature-full-width.feature` ✅
- `PBI-017-class-hp-slot-count.feature` ✅
- `PBI-018-domain-badges-fix.feature` ✅
- `PBI-019-experience-name-and-modifier.feature` ✅
- `PBI-020-nav-compendium-dropdown.feature` ✅
- `PBI-021-character-sheet-identity-traits-layout.feature` ✅
- `PBI-022-damage-thresholds-inline.feature` ✅
- `PBI-023-identity-bar-three-column.feature` ✅

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
- Version control: all work happens on `increment/<slug>` or `fix/PBI-XXX-<slug>` branches in the main working tree. No git worktrees (removed from guidelines 2026-05-14).

**Technical debt:** `dev-flow/product/technical-debt-backlog.md`
- `TD-001` ✅ Resolved — `frontend/vercel.json` SPA rewrite rule created in PBI-005
- `TD-002` P2 — Backend search endpoint Lucene query injection hardening
- `TD-003` ✅ Resolved — Playwright XSS assertion implemented in PBI-009 step defs (`page.on('dialog', ...)`)
- `TD-004` P3 — Migrate data-fetching hooks to React Query

**Accepted ADRs:**
- `ADR-001-spring-security-admin-protection.md` — Spring Security HTTP Basic for admin endpoints
- `ADR-002-html-content-sanitisation.md` — Jsoup `Safelist.basic()` sanitisation on ingest
- `ADR-003-cucumber-acceptance-testing.md` — Cucumber JVM 7.x for backend acceptance tests
- `ADR-004-vitest-component-testing.md` — Vitest 3.x + React Testing Library for frontend component tests
- `ADR-005-playwright-cucumber-e2e.md` — Playwright + Cucumber JS for frontend e2e acceptance tests
- `ADR-006-typescript-compiler-configuration.md` — strict: true tsconfig for frontend TypeScript
- `ADR-007-cra-typescript-integration.md` — CRA used for PBI-004; superseded by ADR-009
- `ADR-008-type-strategy-third-party-deps.md` — @types/react@^18.3, @types/react-dom@^18.3
- `ADR-009-vite-migration.md` — Vite replaces CRA; custom SCSS tilde-fix plugin; `server.port: 3000`
- `ADR-010-api-service-layer-and-hooks.md` — srdApi.ts service layer; useSrdTypes + useSrdSearch hooks; zero fetch calls in components
- `ADR-011-react-router-url-navigation.md` — BrowserRouter in index.tsx; /:type/:filename route; DetailRoute uses fetchItemBySlug (GET /api/srd/{slug}) not search
- `ADR-012-character-sheet-state-management.md` — React Context + useReducer scoped to character-sheet feature; approved 2026-05-14
- `ADR-013-weapon-armor-srd-item-types.md` — WEAPONS/ARMOR as structured SrdItem types in srd.json; HTML-parsing amendment approved 2026-05-14
- `ADR-014-class-hp-slot-count.md` — `hpSlotCount` parsed from CLASSES content at ingestion, stored as nullable `Integer` on `SrdItem`; approved 2026-05-14

**Last updated:** 2026-05-15 — PBI-023 completed and passed independent review; identity bar compact layout increment on `increment/identity-bar-compact`

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
8. **Security agent runs twice.** Once at design time (after architecture, before implementation) and once after implementation (before independent review). Both passes are required for any PBI touching auth, endpoints, user input, or data persistence.
9. **State Update Agent runs automatically.** After every PBI passes independent review, and after every accepted increment, the State Update Agent must update the `Current State` section of this file. Do not skip this step — it is how the next session knows where to start.
10. **Nothing is ever committed directly to `main`.** All changes — code, ADRs, feature files, `CLAUDE.md`, dev-flow documentation — reach `main` through a branch and a pull request. See `dev-flow/engineering/version-control-guidelines.md` for branch naming conventions and the full branching model.
