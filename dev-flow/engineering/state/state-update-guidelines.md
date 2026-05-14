# State Update Agent Guidelines

The State Update Agent runs automatically at two points in the workflow and has one job: keep the `Current State` section of `CLAUDE.md` accurate. This ensures every new Claude Code session opens with a precise, up-to-date picture of where the project stands — without any manual maintenance.

---

## When It Runs

### Trigger 1: After a PBI is completed (on the increment branch)

A PBI is complete when:
- The Independent Review Agent has passed it (no remaining Blockers)
- All `@backend` and `@frontend` acceptance scenarios for that PBI are passing in CI

At this point the State Update Agent runs, updates `CLAUDE.md`, and **commits the change to the current increment branch**. This update is included in the PR and reaches `main` when the branch merges — it is not committed to `main` directly.

### Trigger 2: After an increment is accepted (docs branch)

When the human accepts the Increment Validation Report, the increment branch has already been merged to `main`. The State Update Agent:

1. Creates a `docs/state-update-<increment-slug>` branch from `main`
2. Updates `CLAUDE.md` to reflect the accepted increment and the awaiting-next-increment state
3. Commits to that branch and opens a PR

This keeps the no-direct-commits-to-main rule intact. The PR for a post-acceptance state update is a single-file change and should be reviewed and merged promptly.

---

## What It Reads

Before writing anything, the agent reads:

1. `CLAUDE.md` — the current state it will update
2. All `.feature` files in `dev-flow/product/` — to know which PBIs exist and their IDs
3. Any ADRs in `dev-flow/engineering/architecture/` — to know which are accepted, proposed, or superseded
4. The most recent Increment Validation Report (if one exists in `dev-flow/`) — to get the accepted increment name and verdict
5. The git log for `dev-flow/product/` — to infer which feature files were added in the current increment vs. previous ones (optional, only if needed to disambiguate)

---

## What It Writes

The agent edits **only the `Current State` section** of `CLAUDE.md`. It does not touch any other section. It replaces the section contents entirely with fresh, accurate content.

### Current State section format

```markdown
## Current State

**Active increment:** [Increment name and one-line goal]

**Stage:** [One of the stage descriptions below]

**PBI status:**
- `PBI-001` ✅ Complete
- `PBI-002` ✅ Complete  
- `PBI-003` 🔄 In progress — [current stage, e.g. "Implementation"]
- `PBI-004` ⏳ Pending
- `PBI-005` ⏳ Pending
- `PBI-006` ⏳ Pending

**Feature files:** `dev-flow/product/`
- `PBI-001-security-baseline.feature` ✅
- `PBI-002-backend-service-layer.feature` ✅
- `PBI-003-backend-test-infrastructure.feature` 🔄
- `PBI-004-frontend-typescript-migration.feature` ⏳
- `PBI-005-frontend-architecture.feature` ⏳
- `PBI-006-frontend-test-infrastructure.feature` ⏳

**Priority order:** PBI-003 → PBI-004 → PBI-005 → PBI-006

**Key constraints:** [Any active constraints from the gap analysis or ADRs that the next agent session needs to know — e.g. "PBI-001 must be complete before any other PBI begins."]

**Accepted ADRs:** [List of accepted ADR filenames, or "None yet"]

**Last updated:** YYYY-MM-DD after [trigger description, e.g. "PBI-002 completed"]
```

### Stage descriptions

Use exactly one of these for the `Stage` field:

| Stage | When to use |
|---|---|
| `Awaiting scenario approval — feature files ready for human review` | Acceptance Scenario Agent has produced feature files; human has not yet approved |
| `Scenarios approved — Architecture Agent running` | Human approved scenarios; architecture work in progress |
| `Awaiting architecture approval — ADRs ready for human review` | Architecture Agent has produced ADRs/flow descriptors; human has not yet approved |
| `Architecture approved — Implementation in progress` | Human approved architecture; implementation underway |
| `Implementation complete — Security review in progress` | Implementation done; Security Agent Pass 2 running |
| `Security approved — Independent review in progress` | Security Agent approved; Independent Review Agent running |
| `PBI-XXX complete — PBI-YYY starting` | A PBI just finished and the next is beginning |
| `All PBIs complete — Increment validation in progress` | All PBIs done; Validation Agent running |
| `Increment accepted — awaiting next increment statement` | Increment validated and accepted; no new increment started yet |

---

## Rules

- **Edit only the `Current State` section.** The agent must not modify any other section of `CLAUDE.md`, including the hard rules, the role table, or the project description.
- **Do not infer completion.** A PBI is only marked ✅ Complete if it was explicitly passed by the Independent Review Agent and its CI tests are green. Do not mark a PBI complete because its code was written.
- **Preserve the priority order.** The priority order should reflect only the remaining PBIs — completed ones are removed from the list.
- **Key constraints must be forward-looking.** Only include constraints that are relevant to the next session. Completed and resolved constraints should be removed.
- **The Last updated line is mandatory.** It tells the next agent session how fresh the state is and what triggered the update.
- **Write the update as a single `Edit` to `CLAUDE.md`.** Do not rewrite the whole file. Replace only the `Current State` section content.

---

## After the Final PBI in an Increment

When the last PBI in an increment is completed, the State Update Agent writes a transitional state that reflects the increment is ready for validation:

```markdown
## Current State

**Active increment:** [Increment name] — all PBIs complete

**Stage:** All PBIs complete — Increment validation in progress

**PBI status:**
- `PBI-001` ✅ Complete
- `PBI-002` ✅ Complete
- `PBI-003` ✅ Complete
- `PBI-004` ✅ Complete
- `PBI-005` ✅ Complete
- `PBI-006` ✅ Complete

**Feature files:** All complete ✅

**Accepted ADRs:** [list]

**Last updated:** YYYY-MM-DD after PBI-006 completed — increment ready for validation
```

---

## After Increment Validation is Accepted

When the human accepts the increment, the State Update Agent writes:

```markdown
## Current State

**Active increment:** None — awaiting next increment statement

**Stage:** Increment accepted — awaiting next increment statement

**Completed increments:**
- Foundation increment ✅ — accepted YYYY-MM-DD

**To start a new increment:** Tell Claude: "Start a new increment: [your goal]"

**Accepted ADRs:** [list of all accepted ADRs from all increments]

**Last updated:** YYYY-MM-DD after Foundation increment accepted
```
