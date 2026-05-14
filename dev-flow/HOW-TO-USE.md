# How to Use the Dev Flow

This is the practical guide for triggering and navigating the workflow day-to-day. It tells you exactly what to say, when to say it, and what to do at each checkpoint.

---

## The Short Version

You provide a goal. The agents handle the rest. You review four things:
1. The acceptance scenarios (before engineering starts)
2. The design specification (before architecture starts, frontend PBIs only)
3. The architecture decisions (before implementation starts)
4. The validation report (after delivery)

Everything else — breakdown, prioritisation, implementation, testing, review, security — happens without you unless something needs a human decision.

---

## Reporting a Bug

Use this when something is broken — a behaviour that used to work doesn't, or a feature behaves in a way it shouldn't.

### Trigger phrase

> "Report a bug: [description]"

### What to include

- **Symptom** — what the user sees or experiences (the broken behaviour)
- **Expected behaviour** — what should happen instead
- **Reproduction steps** — the shortest path to trigger the bug reliably
- **Severity assessment** — your initial read on how bad it is (see below)
- **Affected area** — which feature or component is involved

### Severity tiers

| Severity | When to use | Flow |
|---|---|---|
| **Critical** | Data loss, security breach, system unavailable, core feature completely broken | Fast-track: skip full product planning, produce a minimal regression scenario, fix immediately |
| **High** | Major feature broken, no workaround | Jumps the feature queue; treated as higher priority than any pending feature work |
| **Medium** | Feature degraded, workaround exists | Interleaved with feature work (same scheduling as P2 debt) |
| **Low** | Cosmetic issue, rare edge case, minor inconvenience | Opportunistic scheduling (same as P3 debt) |

### What happens after you report

For **Critical bugs**: the Breakdown Agent produces a minimal Bug PBI immediately, the Acceptance Scenario Agent writes a regression scenario (no scenario approval checkpoint — you confirm verbally), and implementation begins. Architecture review is skipped unless the fix requires a design change.

For **High/Medium/Low bugs**: the bug enters the normal product track alongside any pending feature work. The Breakdown Agent produces a Bug PBI, the Prioritization Agent positions it by severity, and the normal agent sequence runs.

**Every bug fix, regardless of severity, must include a regression test** — the Independent Review Agent will block the submission if one is absent.

### Examples

> "Report a bug: Searching with a type filter selected returns all items instead of filtered items. It should only return items of the selected type. Steps: select 'WEAPONS' from the type menu, observe results. Severity: High."

> "Report a bug: Dark mode toggle is missing on mobile viewport (<640px). The button just doesn't render. Low severity — workaround is desktop. Steps: open on mobile, look for toggle."

---

## Starting a New Increment

Kick off the product track by describing what you want to build. You don't need to structure it perfectly — the Breakdown Agent will do that. Give it:

- **What the goal is** — the outcome you want, not a list of features
- **Why it matters** — who benefits and how
- **Any constraints** — deadlines, things to avoid, dependencies on other work
- **Context** — link to any relevant prior increment, ADR, or Jira ticket if applicable

### Trigger phrase

> "Start a new increment: [your goal description]"

### Examples

> "Start a new increment: Users need to be able to reset their password without contacting support. We've had a lot of support tickets about this. It should work via email link. No SMS for now."

> "Start a new increment: The product search is too slow when filters are combined. Users are dropping off. We need to fix performance without changing the UI."

> "Start a new increment: We need an admin panel where managers can view and export user activity logs. This is required for our compliance audit in Q3."

---

## Navigating the Product Track

Once you've triggered the increment, the product agents run in sequence automatically. You'll receive their outputs one after another.

### After the Breakdown Agent

You'll receive a list of PBIs with titles, user stories, scope boundaries, and size estimates.

**What to look for:**
- Does the scope feel right? Are things included that shouldn't be, or missing that should be?
- Are the OUT-of-scope boundaries correct — things explicitly deferred?
- Are the open questions real blockers, or can you answer them quickly?

**What to say:**

To approve and continue:
> "Looks good, continue to prioritisation."

To adjust scope:
> "PBI-002 is too broad, split the export functionality into a separate item. PBI-003 is out of scope for this increment, remove it."

To answer open questions:
> "On PBI-001: session expiry should redirect to login with a message. Self-service unlock is not needed — locked accounts require admin intervention."

---

### After the Prioritization Agent

You'll receive the ordered backlog with a rationale for each item's position.

**What to look for:**
- Does the ordering make sense for what you know about the business?
- Is anything carry-forward from a previous increment buried when it should be urgent?
- Are there dependencies the agent may not know about (team availability, external deadlines)?

**What to say:**

To approve:
> "Priority order looks right, continue to scenarios."

To reorder:
> "Move PBI-003 to position 1 — it's blocking a demo next week."

---

### After the Acceptance Scenario Agent — **Your first checkpoint**

You'll receive the `.feature` files for each PBI. This is the most important review you do in the entire workflow. These scenarios define what "done" means.

**What to look for (use the checklist in `product/acceptance-scenarios.md`):**
- Do the scenarios match what you actually want to build?
- Are the sad paths and security scenarios there?
- Does anything feel missing, or does anything feel out of scope?
- Are the scenario gap list items (if any) decisions you can make now?

**What to say:**

To approve:
> "Scenarios approved, start engineering."

To request changes:
> "On PBI-001: add a scenario for when the reset link has expired. Remove the scenario about concurrent sessions — that's out of scope. The brute force scenario looks right."

To answer scenario gap questions:
> "On the gap list: the reset link should expire after 1 hour. Expired links should show an error page, not redirect to login."

---

## Navigating the Engineering Track

Once scenarios are approved, the Design Agent runs first (for any PBI with frontend scope), then architecture, then implementation, testing and review. You re-enter at the design checkpoint and the architecture checkpoint.

### After the Design Agent — **Your second checkpoint**

You'll receive one Design Specification per PBI that has frontend scope. This is your chance to shape the user experience before any code is written.

**What to look for:**
- Does the layout and interaction model match what you intended?
- Is the copy (button labels, error messages, headings) what you want users to see?
- Are the loading, error, and empty states handled appropriately?
- Do the design decisions and their rationale make sense to you?
- Are there open design questions in the gap list you can answer now?

**What to say:**

To approve and proceed to architecture:
> "Design approved, proceed to architecture."

To request changes:
> "On PBI-XXX: the search results should use a card layout, not a list. The empty state should mention the active type filter."

To answer an open design question:
> "On the gap list: use a spinner for loading states. The error message should include the search query."

To request a change to copy:
> "The 'Submit' button should say 'Search'. The empty state message should read 'No results for \"{query}\"'."

Engineering does not begin until you approve the design for each frontend PBI. If you approve a partial design and ask the agent to hold on certain decisions, those open items must be resolved before the implementation agent picks up that PBI.

---

### After the Architecture Agent — **Your third checkpoint**

You'll receive one or more ADRs and/or flow descriptors. Review these before implementation begins.

**What to look for:**
- Does the proposed approach make sense for the product?
- Is the data flow logical — does data go where it should?
- Are the trade-offs in the ADR ones you're comfortable with?
- Does anything look more complex than it needs to be?
- Are the security notes adequate?

**What to say:**

To approve:
> "Architecture approved, proceed to implementation."

To ask about a trade-off:
> "On ADR-003: why was Option B ruled out? It seems simpler."

To reject an approach:
> "The proposed caching strategy introduces too much complexity for this feature. Go with the simpler direct-query approach and document why in the ADR."

---

### During implementation and review

You don't review this phase unless the review agent escalates to you. If it does, you'll receive a notification with:

- The specific finding (a security issue or architectural deviation)
- What the review agent recommends
- What decision is needed from you

**What to say:**

To accept the recommendation:
> "Agreed, the implementation should be revised as recommended."

To override:
> "Understood the risk. Accept this as a known deviation — document it in a new ADR: [your reasoning]."

---

### After the Increment Validation Agent — **Your fourth checkpoint**

You'll receive the validation report after the increment is deployed to staging. This is your product-level quality gate.

**What to look for:**
- Does the verdict (Delivered / Partially / Not Delivered) match your experience if you try the feature yourself?
- Are the exploratory observations things you agree with?
- Are the carry-forward items ones you want in the next increment?

**What to say:**

To accept the increment:
> "Increment accepted. Add the carry-forward items to the next backlog."

To accept with conditions:
> "Increment accepted, but PBI-002's export flow needs to be fixed before we ship to production. Everything else is fine."

To reject:
> "Not accepted — the password reset link expiry isn't working correctly. That's the core of this increment. Re-work PBI-001 before we validate again."

---

## Managing Branches

Every increment and bug fix lives on its own branch. Nothing commits directly to `main`.

### Starting the branch

When architecture is approved and engineering begins, the branch is created:

```
git checkout -b increment/<slug>        # for a new increment
git checkout -b fix/PBI-XXX-<slug>      # for a bug fix
```

The first commit on the branch includes the ADRs and flow descriptors from the Architecture Agent.

### During implementation

All commits go to the branch — code, documentation, and everything else. The main working tree and `main` branch are not touched.

### After Independent Review passes

Create the PR:
> "Create a PR for this branch."

The PR is not opened earlier. Opening it before review passes creates noise.

### Merging

The human reviews and merges the PR. Merge commits (not squash) are preferred to preserve history. After merge, the increment branch is deleted.

### Post-acceptance state update

After the Increment Validation Report is accepted, the State Update Agent creates a `docs/state-update-<slug>` branch, updates `CLAUDE.md`, and opens a small PR. This is the only follow-up commit after an increment merges.

---

## Other Useful Triggers

### Report a bug
> "Report a bug: [symptom]. [Expected behaviour]. [Reproduction steps]. Severity: [Critical/High/Medium/Low]."

### Resume a paused increment
> "Resume the increment for [feature name]. We're at [stage]."

### Check current status
> "What's the current status of the active increment?"

### Start the next increment using carry-forward items
> "Start the next increment. Use the carry-forward items from the last validation report as the starting point, and add: [new goal if any]."

### Request an ADR for a specific decision
> "We need an ADR for [topic]. The options I'm aware of are [A] and [B]."

### Trigger the Security Agent explicitly (if not auto-triggered)
> "Run a security review on the current increment before we proceed to implementation."

### Ask for the independent review report
> "Show me the current review report for PBI-XXX."

### Add a backlog item mid-increment
> "Add a new PBI to the current increment: [description]. Determine where it fits in the priority order."

---

## What You Never Need to Do

To keep the flow clean, these things are always handled by agents — you don't need to trigger or manage them:

- Writing `.feature` files (Acceptance Scenario Agent)
- Writing step definitions or tests (Test Implementation Agent)
- Running tests or interpreting test output in technical terms (agents report in product language)
- Reviewing code (Independent Review Agent)
- Checking security of implementation (Security Agent)
- Writing ADRs from scratch (Architecture Agent fills the template)
- Resolving review blockers that are routine guideline violations (Implementation Agent handles these in the feedback loop)
- **Updating `CLAUDE.md`** — the State Update Agent does this automatically after every completed PBI and every accepted increment

---

## Quick Reference Card

| What you want to do | What to say |
|---|---|
| Report a bug | "Report a bug: [symptom]. [Expected behaviour]. [Repro steps]. Severity: [level]." |
| Start a new increment | "Start a new increment: [goal]" |
| Approve scenarios and start engineering | "Scenarios approved, start engineering." |
| Approve architecture and start implementation | "Architecture approved, proceed to implementation." |
| Accept the delivered increment | "Increment accepted." |
| Add something mid-increment | "Add a new PBI: [description]" |
| Check where things are | "What's the current status?" |
| Trigger a security review explicitly | "Run a security review on the current increment." |
| Start next increment from carry-forward | "Start the next increment using carry-forward items." |
