# Dev-Flow History

This file records completed work. It exists to keep `CLAUDE.md` lean — only active, forward-looking state belongs there.

---

## Completed PBIs

| PBI | Title / notes |
|---|---|
| `PBI-001` | Security baseline — Spring Security admin protection, Jsoup sanitisation, security headers, CORS consolidation |
| `PBI-002` | Backend service layer — SrdService extracted from controller; SrdRepository introduced |
| `PBI-003` | Backend test infrastructure — Cucumber JVM 7.x + JUnit 5 acceptance test harness |
| `PBI-004` | Frontend TypeScript migration — CRA-based TypeScript baseline (superseded by ADR-009 in PBI-005) |
| `PBI-005` | Frontend architecture — Vite migration (ADR-009); srdApi.ts service layer + useSrdTypes/useSrdSearch hooks (ADR-010); React Router URL navigation (ADR-011) |
| `PBI-006` | Frontend test infrastructure — Vitest + RTL component tests; Playwright + Cucumber JS e2e harness |
| `PBI-007` | Multiword item navigation — slugified URL routing for multi-word SRD item names |
| `PBI-008` | Character sheet foundation — layout scaffold, CharacterContext + useReducer state (ADR-012) |
| `PBI-009` | Character sheet class identity — ClassHeader; useSrdClasses/useSrdSubclasses hooks; XSS e2e assertion (TD-003 resolved) |
| `PBI-010` | Character sheet traits & defence — TraitsSection (6 trait scores); DefenceSection |
| `PBI-011` | Character sheet health, hope & gold — DamageHealthSection; HP/stress/hope slot gauges via `gaugeToggle` |
| `PBI-012` | Character sheet weapons & armor — WeaponsSection; ArmorSection; WEAPONS/ARMOR HTML parsing (ADR-013) |
| `PBI-013` | Character sheet styles — polished SCSS; styled nav link |
| `PBI-014` | Trait input width — widened trait score input to prevent clipping |
| `PBI-015` | Slot tracker gauge behaviour — `gaugeToggle` fills 0..N on click N; empties on re-click of last filled |
| `PBI-016` | Class feature full width — ClassFeatureSection moved below two-column grid |
| `PBI-017` | Class HP slot count — `hpSlotCount` parsed from CLASSES content at ingestion (ADR-014); `hpSolidCount` wired through context into DamageHealthSection |
| `PBI-018` | Domain badges fix — `extractDomains` fixed to capture `<a>` link text; domain names now come from link text not plain text nodes |
| `PBI-019` | Experience name and modifier — each experience row split into name (text) + modifier (number) fields; ExperienceEntry type, reducer, hook, component, CSS updated |
| `PBI-020` | Nav compendium dropdown — primary row (Compendium toggle + Character Sheet) and secondary row (SRD category links); route-aware open/closed state |
| `PBI-021` | Character sheet identity and traits layout — ClassHeader and TraitsSection moved to full-width rows above the two-column grid; traits grid changed to `repeat(6, 1fr)` |
| `PBI-022` | Damage thresholds inline — thresholds rendered as inline single row with two inputs; `severe` field removed from DamageThresholds state |
| `PBI-023` | Identity bar three-column — identity bar grid changed from `1fr 1fr` to `repeat(3, 1fr)`; responsive overrides: 2 cols at ≤768px, 1 col at ≤480px |

---

## Completed Feature Files

All feature files live in `dev-flow/product/`.

| File | Status |
|---|---|
| `PBI-001-security-baseline.feature` | ✅ |
| `PBI-002-backend-service-layer.feature` | ✅ |
| `PBI-003-backend-test-infrastructure.feature` | ✅ |
| `PBI-004-frontend-typescript-migration.feature` | ✅ |
| `PBI-005-frontend-architecture.feature` | ✅ |
| `PBI-006-frontend-test-infrastructure.feature` | ✅ |
| `PBI-007-multiword-item-navigation.feature` | ✅ |
| `PBI-008-character-sheet-foundation.feature` | ✅ |
| `PBI-009-character-sheet-class-identity.feature` | ✅ |
| `PBI-010-character-sheet-traits-defence.feature` | ✅ |
| `PBI-011-character-sheet-health-hope-gold.feature` | ✅ |
| `PBI-012-character-sheet-weapons-armor.feature` | ✅ |
| `PBI-013-character-sheet-styles.feature` | ✅ |
| `PBI-014-trait-input-width.feature` | ✅ |
| `PBI-015-slot-tracker-gauge-behaviour.feature` | ✅ |
| `PBI-016-class-feature-full-width.feature` | ✅ |
| `PBI-017-class-hp-slot-count.feature` | ✅ |
| `PBI-018-domain-badges-fix.feature` | ✅ |
| `PBI-019-experience-name-and-modifier.feature` | ✅ |
| `PBI-020-nav-compendium-dropdown.feature` | ✅ |
| `PBI-021-character-sheet-identity-traits-layout.feature` | ✅ |
| `PBI-022-damage-thresholds-inline.feature` | ✅ |
| `PBI-023-identity-bar-three-column.feature` | ✅ |

---

## Accepted ADRs

Full ADR documents live in `dev-flow/engineering/architecture/`.

| ADR | Decision |
|---|---|
| `ADR-001-spring-security-admin-protection.md` | Spring Security HTTP Basic for admin endpoints |
| `ADR-002-html-content-sanitisation.md` | Jsoup `Safelist.basic()` sanitisation on ingest |
| `ADR-003-cucumber-acceptance-testing.md` | Cucumber JVM 7.x for backend acceptance tests |
| `ADR-004-vitest-component-testing.md` | Vitest 3.x + React Testing Library for frontend component tests |
| `ADR-005-playwright-cucumber-e2e.md` | Playwright + Cucumber JS for frontend e2e acceptance tests |
| `ADR-006-typescript-compiler-configuration.md` | `strict: true` tsconfig for frontend TypeScript |
| `ADR-007-cra-typescript-integration.md` | CRA used for PBI-004; superseded by ADR-009 |
| `ADR-008-type-strategy-third-party-deps.md` | `@types/react@^18.3`, `@types/react-dom@^18.3` |
| `ADR-009-vite-migration.md` | Vite replaces CRA; custom SCSS tilde-fix plugin; `server.port: 3000` |
| `ADR-010-api-service-layer-and-hooks.md` | `srdApi.ts` service layer; `useSrdTypes` + `useSrdSearch` hooks; zero fetch calls in components |
| `ADR-011-react-router-url-navigation.md` | BrowserRouter in `index.tsx`; `/:type/:filename` route; DetailRoute uses `fetchItemBySlug` |
| `ADR-012-character-sheet-state-management.md` | React Context + useReducer scoped to character-sheet feature |
| `ADR-013-weapon-armor-srd-item-types.md` | WEAPONS/ARMOR as structured SrdItem types in `srd.json`; HTML-parsing amendment approved |
| `ADR-014-class-hp-slot-count.md` | `hpSlotCount` parsed from CLASSES content at ingestion, stored as nullable `Integer` on `SrdItem` |
