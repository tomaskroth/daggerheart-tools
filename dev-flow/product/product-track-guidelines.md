# Product Track Guidelines

This document defines the three agents that operate on the product side of the workflow, before engineering begins. They run in sequence for each product increment and produce the artefacts that engineering agents work from.

```
Product Increment Statement
         │
         ▼
 [Breakdown Agent]
 Produces: backlog items (PBIs)
         │
         ▼
 [Prioritization Agent]
 Produces: ordered backlog with rationale
         │
         ▼
 [Acceptance Scenario Agent]
 Produces: .feature files per PBI
         │
         ▼
 👤 Human checkpoint: review scenarios
         │
         ▼
      Engineering Track
```

---

## 1. Breakdown Agent

### Purpose

Translates a product increment statement — a goal, problem, or feature description — into a set of discrete, implementable backlog items (Product Backlog Items, or PBIs). Each PBI is a unit of work small enough to be implemented and validated independently within a single development cycle.

### What It Receives

- The **product increment statement**: a plain-language description of what needs to be built or changed, and why. This may come from a product owner, a stakeholder, or the carry-forward section of the previous Increment Validation Report.
- The **existing backlog** (if any), to avoid duplicating items and to identify dependencies.
- Accepted **ADRs** — to be aware of existing architectural constraints that affect scope.

### What It Produces

A set of PBIs, each containing:

```
PBI-XXX: [Title — imperative, concrete, user-facing]

Type: Feature | Bug | Tech enabler | Security | Debt

User story:
  As a [role],
  I want to [do something specific],
  So that [I achieve a concrete outcome].

Scope:
  IN: [Specific behaviours and states included in this PBI]
  OUT: [Related things explicitly excluded — deferred to another PBI or increment]

Dependencies:
  - PBI-YYY must be complete before this begins (reason)
  - ADR-XXX constrains the implementation approach

Estimated size: XS | S | M | L | XL
  [Brief rationale for the size estimate]

Open questions:
  - [Anything that needs a product decision before scenarios can be written]
```

### Breakdown Rules

**Each PBI must be independently deliverable.** A PBI that can only be validated in combination with another PBI should be merged or restructured.

**Each PBI must be user-visible or infrastructure for a user-visible outcome.** Pure refactoring PBIs must reference the user-visible benefit they enable.

**Scope boundaries must be explicit.** The OUT section is as important as the IN section. It prevents scope creep and makes prioritisation honest.

**A PBI should take no more than one development cycle to implement.** If a PBI feels too large, it should be split. The Breakdown Agent must flag any PBI it cannot confidently split further but that still feels large.

**Open questions block scenario writing.** If a PBI has open questions that would prevent the Acceptance Scenario Agent from writing complete scenarios, those questions must be surfaced before the item enters the backlog. The Breakdown Agent escalates these to the human before the Prioritization Agent runs.

### Size Definitions

| Size | Meaning |
|---|---|
| XS | Trivial change, well-understood, no new patterns |
| S | Small feature or change, clear scope, follows existing patterns |
| M | Moderate feature, some design decisions needed, follows established architecture |
| L | Complex feature, likely requires an ADR, multiple components affected |
| XL | Too large — must be split before entering the backlog |

---

## 2. Prioritization Agent

### Purpose

Orders the backlog produced by the Breakdown Agent into a delivery sequence. The order is not arbitrary — it is reasoned and documented, so the human can challenge it.

### What It Receives

- The full set of PBIs from the Breakdown Agent for the current increment.
- The existing ordered backlog (items from previous increments not yet started).
- Accepted ADRs and flow descriptors — to understand technical dependencies.
- The carry-forward gaps from the most recent Increment Validation Report (if any).

### What It Produces

An **ordered backlog** with a rationale entry for each item's position:

```
## Ordered Backlog — [Increment Name]

1. PBI-XXX: [Title]
   Priority: Critical
   Rationale: Foundation for all other PBIs in this increment. Authentication must exist
              before any protected feature can be built or tested.

2. PBI-YYY: [Title]
   Priority: High
   Rationale: Directly addresses the primary user goal of this increment. No dependencies
              on other PBIs. Should ship early to allow validation feedback.

3. PBI-ZZZ: [Title]
   Priority: Medium
   Rationale: Enhances the core flow but is not required for the primary goal.
              Deferred slightly to avoid blocking PBI-YYY.

---

## Carry-forward from previous increment (unresolved)

4. PBI-AAA: [Title]
   Priority: High
   Rationale: Deferred session timeout behaviour from PBI-001. Required for auth
              security completeness. Promoted above new items of equal size.
```

### Prioritization Criteria

The agent weighs the following in order:

1. **Dependencies** — items that block others must be sequenced first, regardless of business value.
2. **Risk** — high-risk or high-uncertainty items are moved earlier to surface problems while there is time to respond.
3. **User value** — items that directly deliver the primary goal of the increment are preferred over enablers and enhancements.
4. **Carry-forward debt** — unresolved gaps from previous validation reports are treated as high priority unless explicitly deprioritised by the human.
5. **Size** — among equally-valued items, smaller items are preferred to maintain delivery momentum.

The agent must **not** silently bury carry-forward items at the bottom of the backlog. They must be explicitly positioned and their placement justified.

### Escalation

If two items cannot be ordered without a product decision (e.g., a trade-off between two equally important user needs), the agent surfaces this as an explicit question to the human before finalising the order.

---

## 3. Acceptance Scenario Agent

### Purpose

Writes the Gherkin `.feature` files for each PBI, following the format and conventions in `product/acceptance-scenarios.md`. These files are the contract between product intent and engineering — once approved by the human, they define what "done" means for that PBI.

### What It Receives

- The ordered PBIs from the Prioritization Agent (it writes scenarios in priority order).
- The acceptance scenario format guidelines (`product/acceptance-scenarios.md`).
- Accepted ADRs and flow descriptors from previous increments — to ensure scenarios are consistent with established system behaviour.
- The carry-forward section of the most recent Increment Validation Report — to incorporate previously identified gaps as scenarios.

### What It Produces

One `.feature` file per PBI, saved to `dev-flow/product/`, following the naming convention `PBI-XXX-<short-slug>.feature`.

### Scenario Writing Rules

The agent follows all conventions in `product/acceptance-scenarios.md` and additionally:

**Covers the full behavioural surface.** For each PBI, it must produce scenarios for:
- The primary happy path (minimum one)
- Each meaningful sad path (invalid input, missing data, not found, permission denied)
- Edge cases relevant to the stated scope
- Security cases for any scenario involving authentication, authorisation, or user-provided input

**Does not invent scope.** Scenarios must trace to the PBI's IN scope. If writing a complete scenario requires a behaviour that is in the OUT scope or that has no basis in the PBI, the agent flags this rather than writing the scenario silently.

**Surfaces ambiguity as questions, not assumptions.** If the PBI's open questions section contains unresolved items, the agent writes the scenarios it can write confidently and produces a **scenario gap list** for the open questions:

```
## Scenario Gap List — PBI-XXX

The following aspects of PBI-XXX could not be covered by scenarios due to unresolved
open questions. These must be answered before the feature file is complete.

1. OPEN: What happens when a user's account is locked due to brute force?
   Is there a self-service unlock flow, or does it require admin intervention?
   → This affects Scenario: "Brute force protection" — the Then step is ambiguous.

2. OPEN: Should session expiry redirect to login with a message, or silently redirect?
   → This affects Scenario: "Session expires after inactivity" — the Then step
      depends on a product decision.
```

The scenario gap list is escalated to the human before engineering begins.

**Tags are applied correctly.** Every scenario carries the appropriate tags from the tagging scheme in `product/acceptance-scenarios.md`. The agent does not omit security tags for scenarios that involve auth, permissions, or user input.

### Human Checkpoint

Once `.feature` files are produced, the human reviews them using the checklist in `product/acceptance-scenarios.md`. This is the last step before the Architecture Agent begins. The human's approval of the scenarios is the trigger for engineering to start.

If the human requests changes, the Acceptance Scenario Agent revises and resubmits. Engineering does not begin until the human approves the scenarios.

---

## Product Track Outputs Summary

| Agent | Output | Location | Triggers next step |
|---|---|---|---|
| Breakdown Agent | PBI definitions | (delivered in planning session) | Prioritization Agent runs |
| Prioritization Agent | Ordered backlog | (delivered in planning session) | Acceptance Scenario Agent runs |
| Acceptance Scenario Agent | `.feature` files | `dev-flow/product/PBI-XXX-*.feature` | 👤 Human approves scenarios |
| Human approval | Approved scenarios | (confirmation) | Architecture Agent begins |
