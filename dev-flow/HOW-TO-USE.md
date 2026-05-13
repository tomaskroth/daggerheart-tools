# How to Use the Dev Flow

This is the practical guide for triggering and navigating the workflow day-to-day. It tells you exactly what to say, when to say it, and what to do at each checkpoint.

---

## The Short Version

You provide a goal. The agents handle the rest. You review three things:
1. The acceptance scenarios (before engineering starts)
2. The architecture decisions (before implementation starts)
3. The validation report (after delivery)

Everything else — breakdown, prioritisation, implementation, testing, review, security — happens without you unless something needs a human decision.

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

Once scenarios are approved, engineering begins automatically. The Architecture Agent runs first, then implementation, then testing and review. You only re-enter at the architecture checkpoint.

### After the Architecture Agent — **Your second checkpoint**

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

### After the Increment Validation Agent — **Your third checkpoint**

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

## Other Useful Triggers

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
| Start a new increment | "Start a new increment: [goal]" |
| Approve scenarios and start engineering | "Scenarios approved, start engineering." |
| Approve architecture and start implementation | "Architecture approved, proceed to implementation." |
| Accept the delivered increment | "Increment accepted." |
| Add something mid-increment | "Add a new PBI: [description]" |
| Check where things are | "What's the current status?" |
| Trigger a security review explicitly | "Run a security review on the current increment." |
| Start next increment from carry-forward | "Start the next increment using carry-forward items." |
