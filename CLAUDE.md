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
3. **Architecture** — ADRs and flow descriptors produced for each PBI
4. **Human checkpoint** — human approves architecture
5. **Implementation** — Frontend and backend agents implement against the approved design
6. **Security review** — inline, two passes (design + implementation)
7. **Testing** — Test agent writes step definitions from `.feature` files
8. **Independent review** — separate agent reviews code against guidelines
9. **Human checkpoint** — human reviews escalations only
10. **State update** — State Update Agent rewrites `Current State` in this file
11. **Validation** — increment validated against original intent
12. **State update** — State Update Agent rewrites `Current State` in this file again after increment is accepted

**Read `dev-flow/HOW-TO-USE.md` if you need to understand how to trigger or navigate any stage.**

---

## Your Role in Each Session

Determine what you're being asked to do, then read the corresponding guideline file before proceeding. Do not act without reading the relevant file first.

| You are acting as… | Read this before starting |
|---|---|
| **Breakdown Agent** | `dev-flow/product/product-track-guidelines.md` |
| **Prioritization Agent** | `dev-flow/product/product-track-guidelines.md` |
| **Acceptance Scenario Agent** | `dev-flow/product/product-track-guidelines.md` + `dev-flow/product/acceptance-scenarios.md` |
| **Architecture Agent** | `dev-flow/engineering/architecture/architecture-guidelines.md` |
| **Implementation Agent (backend)** | `dev-flow/engineering/guidelines/coding-guidelines.md` + relevant accepted ADRs in `dev-flow/engineering/architecture/` |
| **Implementation Agent (frontend)** | `dev-flow/engineering/guidelines/coding-guidelines.md` + relevant accepted ADRs in `dev-flow/engineering/architecture/` |
| **Security Agent** | `dev-flow/engineering/security/security-agent-guidelines.md` |
| **Test Implementation Agent** | `dev-flow/engineering/testing/testing-strategy.md` + the `.feature` file(s) for the PBI |
| **Independent Review Agent** | `dev-flow/engineering/review/independent-review-guidelines.md` + `dev-flow/engineering/guidelines/coding-guidelines.md` |
| **Increment Validation Agent** | `dev-flow/engineering/validation/increment-validation-guidelines.md` |
| **State Update Agent** | `dev-flow/engineering/state/state-update-guidelines.md` |

---

## Current State

**Active increment:** Foundation — establish architectural patterns, test infrastructure, and security baseline.

**Stage:** PBI-001 complete — PBI-002 starting

**PBI status:**
- `PBI-001` ✅ Complete
- `PBI-002` 🔄 In progress — Architecture
- `PBI-003` ⏳ Pending
- `PBI-006` ⏳ Pending
- `PBI-004` ⏳ Pending
- `PBI-005` ⏳ Pending

**Feature files:** `dev-flow/product/`
- `PBI-001-security-baseline.feature` ✅
- `PBI-002-backend-service-layer.feature` ⏳
- `PBI-003-backend-test-infrastructure.feature` ⏳
- `PBI-006-frontend-test-infrastructure.feature` ⏳
- `PBI-004-frontend-typescript-migration.feature` ⏳
- `PBI-005-frontend-architecture.feature` ⏳

**Priority order:** PBI-002 → PBI-003 → PBI-006 → PBI-004 → PBI-005

**Key constraints:**
- `SrdController` still holds direct `SrdItemRepository` and `LuceneService` references for `search()` and `bySlug()` — marked `// TODO PBI-002`. These must be extracted as part of PBI-002 before PBI-002 can be marked complete.
- The `@frontend @security` scenario ("Item detail page does not execute script tags") is deferred to PBI-006 (Playwright infrastructure). Backend sanitisation is in place; the scenario will be tested end-to-end once the e2e runner exists.

**Accepted ADRs:**
- `ADR-001-spring-security-admin-protection.md` — Spring Security HTTP Basic for admin endpoints
- `ADR-002-html-content-sanitisation.md` — Jsoup `Safelist.basic()` sanitisation on ingest

**Last updated:** 2026-05-13 — PBI-001 completed, passed independent review (two-pass security review ✅, 15/15 tests green)

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
