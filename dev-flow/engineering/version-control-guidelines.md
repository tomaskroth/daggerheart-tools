# Version Control Guidelines

This document defines the branching model, naming conventions, and commit rules for the project. Every agent that touches the repository must follow these rules. There are no exceptions.

---

## The Fundamental Rule

**Nothing is ever committed directly to `main`.**

`main` represents production-ready, reviewed, tested code. Every change — code, documentation, ADRs, feature files, `CLAUDE.md` updates — reaches `main` through a branch and a pull request. If you find yourself about to commit to `main` directly, stop and create a branch.

---

## Branch Types and Naming

### Increment branches
Used for all feature work across one or more PBIs within a single increment.

```
increment/<slug>
```

Examples:
- `increment/foundation`
- `increment/search-improvements`
- `increment/user-accounts`

One branch per increment. All PBIs in the increment are implemented, reviewed, and committed on this branch. The branch is created at the start of engineering (when architecture is approved) and lives until the PR is merged.

### Bug fix branches
Used for bug reports processed through the bug track.

```
fix/PBI-XXX-<slug>
```

Examples:
- `fix/PBI-007-multiword-navigation`
- `fix/PBI-012-filter-race-condition`

One branch per bug. Created immediately when the bug enters the engineering track. Merged to `main` independently of any in-flight increment branch.

### Documentation patch branches
Used when updating dev-flow guidelines, ADRs, or `CLAUDE.md` outside of an active increment (e.g., governance changes, retrospective updates, post-acceptance state updates).

```
docs/<slug>
```

Examples:
- `docs/add-branching-strategy`
- `docs/state-update-after-foundation-accepted`

These branches are small, reviewed quickly, and merged promptly. They exist because even a single-file change to a guideline deserves a review step.

---

## What Belongs on Each Branch

The branch is the single source of truth for everything related to its increment or bug. This means the branch contains:

**Code changes:**
- All frontend and backend implementation

**Dev-flow artefacts for this increment:**
- ADRs and flow descriptors (`dev-flow/engineering/architecture/PBI-XXX-*.md`, `ADR-XXX-*.md`)
- Acceptance scenario files (`dev-flow/product/PBI-XXX-*.feature`)
- Updates to `technical-debt-backlog.md` if new debt is identified or resolved

**State:**
- `CLAUDE.md` — updated by the State Update Agent on the branch before the PR is created

**What does NOT go directly to main:**
- Nothing. See the fundamental rule above.

---

## Branch Lifecycle

```
main
  │
  ├── [architecture approved + increment starts]
  │
  └── increment/<slug>  ←── branch created here
        │
        ├── commit: PBI-XXX implementation + ADR + .feature file
        ├── commit: PBI-YYY implementation
        ├── commit: PBI-ZZZ implementation + bug fix
        ├── commit: CLAUDE.md update (State Update Agent)
        │
        └── [Independent Review passes, all tests green]
              │
              └── PR opened → human reviews → merged to main
```

### When to create the branch

The branch is created when the Architecture Agent completes its work and the human approves the architecture. At that point, the ADRs and flow descriptors are committed to the branch as the first commit. Implementation follows on the same branch.

If an increment has no architecture decisions (e.g., a small bug fix that skips the architecture checkpoint), the branch is created when implementation begins.

### When to open the PR

The PR is opened **after** the Independent Review Agent passes the submission with no remaining Blockers and all tests are green. Opening a PR before review passes creates noise and false signals.

Do not open the PR speculatively during implementation.

### What triggers merge

The human merges the PR. The merge is the human's final confirmation that the code is ready for `main`. No automated merge.

### Merge strategy

Use a **merge commit** (not squash, not rebase). This preserves the individual commits on the branch and keeps the history legible. The merge commit message should reference the increment name and PBI IDs:

```
Merge increment/foundation: PBI-004, PBI-005, PBI-006, PBI-007
```

---

## Commit Conventions

### One logical unit per commit

Each commit on the branch should represent one coherent unit of work:
- One PBI's implementation (code + its ADR + its `.feature` file together)
- One State Update Agent run
- One bug fix + its regression test

Do not mix unrelated PBIs in a single commit. Do not separate a PBI's code from its ADR or its `.feature` file.

### Commit message format

```
<type>(<scope>): <short description>

<body — what changed and why, not how>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
```
feat(PBI-005): Vite migration, React Router, API service layer

Replaces CRA with Vite (ADR-009). Extracts all fetch calls into
srdApi.ts (ADR-010). Introduces BrowserRouter and /:type/:filename
route with direct slug lookup (ADR-011). Resolves TD-001.
```

```
fix(PBI-007): Use slug lookup endpoint for item detail navigation

DetailRoute was passing the URL slug as a Lucene query, which
failed for multi-word slugs due to hyphen operator handling.
Now uses GET /api/srd/{slug} directly.
```

---

## CLAUDE.md and the State Update Agent

`CLAUDE.md` is not special — it follows the same rule as everything else. It is updated on the branch, not on `main`.

### State update during an increment (on the branch)

When a PBI passes Independent Review, the State Update Agent:
1. Updates `CLAUDE.md` on the current increment branch
2. Commits the update to the branch
3. The updated state is then included in the PR and merged to `main` with the rest of the work

### State update after increment acceptance (docs branch)

After the human accepts the Increment Validation Report (which happens post-merge, against the deployed staging environment), the State Update Agent:
1. Creates a `docs/state-update-<increment-slug>` branch from `main`
2. Updates `CLAUDE.md` to reflect the accepted increment and awaiting-next-increment state
3. Opens a PR — this is a single-file change, reviewed and merged promptly

This keeps the no-direct-commits rule intact even for post-acceptance housekeeping.

---

## Working on a Branch

All file edits happen directly on the increment or fix branch in the main working tree. Do **not** use git worktrees — they introduce a second checkout of the repository that agents consistently confuse with the main working tree, leading to edits landing in the wrong place.

### Starting work on an increment

```bash
git checkout main
git pull
git checkout -b increment/<slug>
```

All subsequent edits — code, ADRs, feature files, `CLAUDE.md` — are made in this checkout and committed to the branch.

### Switching context mid-session

If you need to pause increment work and make a docs-only change, finish and commit what you have on the increment branch first, then:

```bash
git stash        # if there are in-progress edits that aren't ready to commit
git checkout -b docs/<slug>
# make the docs change, commit, push, open PR
git checkout increment/<slug>
git stash pop    # restore in-progress work if stashed
```

Never leave uncommitted changes in the working tree when switching branches.

---

## Summary Table

| What | Branch type | Goes directly to main? |
|---|---|---|
| PBI feature code | `increment/<slug>` | ❌ Never |
| Bug fix code | `fix/PBI-XXX-<slug>` | ❌ Never |
| ADRs and flow descriptors | Same branch as the code | ❌ Never |
| Acceptance scenario `.feature` files | Same branch as the code | ❌ Never |
| `CLAUDE.md` (mid-increment) | Same increment branch | ❌ Never |
| `CLAUDE.md` (post-acceptance) | `docs/state-update-<slug>` | ❌ Never |
| Dev-flow guideline updates | `docs/<slug>` or same increment branch | ❌ Never |
| `technical-debt-backlog.md` changes | Same increment branch | ❌ Never |
