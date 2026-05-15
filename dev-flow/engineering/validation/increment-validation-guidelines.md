# Increment Validation Guidelines

This document defines how the Increment Validation Agent operates after a product increment is delivered. Its purpose is to answer one question on behalf of the human: **did this increment do what it was supposed to do?**

This is distinct from code review (was it built correctly?) and test coverage (does the code pass its tests?). Validation is about product intent — whether the delivered increment fulfils the goal stated when the increment began.

---

## When Validation Runs

The Increment Validation Agent runs after:

1. All Blockers from the Independent Review Agent have been resolved.
2. All acceptance tests pass (locally or in CI — wherever the full test suite can be run against the assembled application).

Validation does **not** require a deployed staging environment. The test suite is the primary validation mechanism. Step 3 (exploratory walkthrough) is optional — it should only be performed when there is a specific concern that automated tests do not cover, and the human has explicitly requested it or the agent has identified a gap.

---

## What the Validation Agent Receives

- The **original product increment statement** — the goal or problem statement that kicked off this increment.
- All `.feature` files associated with the increment's backlog items.
- The **acceptance test results** from CI (which scenarios passed, which failed, which were skipped).
- Access to the deployed application to perform exploratory validation steps beyond what automated tests cover.
- The flow descriptors and accepted ADRs for the increment — to understand what was designed and why.

---

## What the Validation Agent Does

### Step 1: Reconcile intent with scenarios

The agent reads the original product increment statement and maps it against the `.feature` files. It checks:

- Do the scenarios cover the full stated intent, or are there aspects of the goal that have no corresponding scenario?
- Are there scenarios that were added during implementation that don't trace back to the stated intent (scope additions)?
- Are there scenarios marked `@wip` that represent undelivered intent?

Any gap between stated intent and scenario coverage is flagged — not necessarily as a failure, but as something the human must acknowledge.

### Step 2: Review automated test results

The agent reads the CI test results for all scenarios tagged to this increment. It does not re-run tests — it interprets the results in product terms:

- **All scenarios pass** → automated confidence is high.
- **Some scenarios fail** → these represent undelivered functionality. Each failure is described in plain language (not as a test error — as a product behaviour that is missing or broken).
- **Scenarios skipped (`@wip`)** → these represent known gaps. Each is assessed against the increment intent: is this gap acceptable for this increment, or does it leave the stated goal partially unmet?

### Step 3: Exploratory validation (optional)

This step is only performed when the agent has identified a specific concern that automated tests do not cover, or when the human has explicitly requested it. It is not a default step.

When performed, the agent conducts a structured walkthrough of the primary user flow:

- Does the feature feel complete? Are there obvious missing pieces a scenario didn't capture?
- Are error states handled gracefully from the user's perspective (not just technically correct)?
- Does the feature interact correctly with adjacent features that were not part of this increment?
- Are there performance or responsiveness issues visible to a user that tests don't catch?
- Are there UI states that are broken, confusing, or incomplete that are not covered by a scenario?

Findings from this step are reported as **Observations** — they are not pass/fail, but they inform the human's decision and feed into the next increment's backlog.

If this step is skipped, the Validation Report notes: `"Exploratory walkthrough: not performed — no specific concerns identified beyond automated test coverage."`

### Step 4: Produce the validation report

---

## Validation Report Format

```
# Increment Validation Report

**Increment:** [Increment name / goal statement]
**Date:** YYYY-MM-DD
**Test run:** [local / CI — where the acceptance suite was run]
**Backlog items:** PBI-XXX, PBI-YYY, ...

---

## Verdict

✅ DELIVERED  |  ⚠ PARTIALLY DELIVERED  |  ❌ NOT DELIVERED

[2–3 sentence plain-language summary of the verdict. Written for a product owner, not an engineer. State what was achieved, what was not, and what the impact is.]

---

## Intent vs. Delivery

| Stated Intent | Covered by Scenarios | Test Result | Assessment |
|---|---|---|---|
| [Aspect of the original goal] | ✅ Yes / ⚠ Partial / ❌ No | ✅ Pass / ❌ Fail / ⏭ Skipped | [Brief note] |
| … | | | |

**Scope additions** (scenarios present but not traceable to stated intent):
- [List any scenarios that appear to have been added beyond the original goal, with a note on whether they are desirable.]

---

## Scenario Results (Plain Language)

[For each scenario, a one-line product-language description of what it verified and whether it passed. No test jargon.]

**PBI-XXX — [Feature Name]**

| Scenario | Result | Notes |
|---|---|---|
| Successful login with valid credentials | ✅ Pass | — |
| Login fails with incorrect password | ✅ Pass | — |
| Brute force protection triggers | ✅ Pass | — |
| User session expires after inactivity | ⏭ Skipped | Session timeout config not ready. See PBI-XXX. |

---

## Exploratory Observations

[Findings from the walkthrough of the deployed application that go beyond automated test coverage. These are product-perspective notes, not bugs or blockers per se — they are input for the human's judgement and the next increment's planning.]

### [O1] [Short title]
**Area:** [Feature / flow affected]
**Observation:** [Plain-language description of what was noticed.]
**Suggested action:** [Leave as-is / Add to next increment backlog / Raise as a bug]

### [O2] …

---

## Gaps and Carry-Forward

[Items from this increment that were not fully delivered — whether due to failing tests, skipped scenarios, or exploratory findings. These are proposed as input to the next increment's Breakdown Agent.]

| Item | Type | Priority suggestion | Reason |
|---|---|---|---|
| Session timeout behaviour | @wip scenario | High | Core to auth security; deferred due to config dependency |
| [Observation O1 title] | Exploratory finding | Medium | UX issue in error state |

---

## 👤 Human Decision

Based on this report, the human confirms one of the following:

- **[ ] Increment accepted** — The delivery meets the stated intent. Carry-forward items are added to the backlog.
- **[ ] Increment accepted with conditions** — The delivery is acceptable but specific gaps must be addressed before the next increment begins. [Specify conditions.]
- **[ ] Increment not accepted** — The delivery does not meet the stated intent. [Specify what must be resolved and whether re-work begins immediately or after planning.]

**Notes:** [Any additional context from the human review.]
```

---

## Verdict Definitions

| Verdict | Meaning |
|---|---|
| ✅ DELIVERED | All scenarios pass, stated intent is fully covered, no critical exploratory findings. Minor observations may exist but do not undermine the increment's goal. |
| ⚠ PARTIALLY DELIVERED | The increment delivers its primary goal but with notable gaps — failing or skipped scenarios that represent real missing behaviour, or exploratory findings that leave the feature incomplete for users. The human decides whether to accept or require resolution. |
| ❌ NOT DELIVERED | The increment does not deliver its stated goal. Core scenarios fail, or the stated intent is not reflected in what was built. Re-work is required before the increment is accepted. |

---

## Feeding Back into the Next Increment

The Increment Validation Agent's report is the primary input to the next planning cycle. After the human accepts the increment, the report's **Gaps and Carry-Forward** section is passed to the Breakdown Agent as:

- Known gaps to be addressed
- Observed issues not captured in original scenarios
- Deferred `@wip` scenarios that remain outstanding

This creates a continuous loop: each increment's validation directly informs the next increment's breakdown and prioritisation, ensuring that what slips through is never lost.

---

## What Validation Is Not

- It is not a QA sign-off. QA is the test suite. Validation is about product intent.
- It is not a performance benchmark. It may note obvious performance concerns, but it does not run load tests.
- It is not a security audit. The Security Agent handles security. Validation may flag obvious issues observed during walkthrough, but it defers to the Security Agent for assessment.
- It is not a code review. The Independent Review Agent handles that. Validation never looks at source code.
