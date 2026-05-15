# UX/Design Agent Guidelines

This document defines how the UX/Design Agent operates — when it runs, what it produces, how its output is structured, and what constitutes a valid design specification for handoff to the frontend engineer.

---

## Purpose

The UX/Design Agent is responsible for translating approved acceptance scenarios into a concrete design specification that the frontend engineer can implement without ambiguity. It bridges the gap between "what the feature must do" (the `.feature` file) and "how the user interacts with it" (layout, components, states, interactions).

The Design Agent does **not** write code. It produces design artefacts only.

---

## When the Design Agent Runs

The Design Agent runs **after the Acceptance Scenario Agent** and **before the Architecture Agent**, but only for PBIs that have frontend or user interface scope.

```
[Human approves scenarios]
         │
         ▼
 [Design Agent]  ← only for PBIs with @frontend or @e2e scenarios
 Produces: Design Specification
         │
         ▼
 👤 Human checkpoint: approve design
         │
         ▼
 [Architecture Agent]
         │
         ...
```

### PBIs that trigger the Design Agent

A PBI triggers the Design Agent if it has **any** of the following:

- Scenarios tagged `@frontend` or `@e2e`
- A user story that describes an interaction (clicking, navigating, submitting a form, viewing a page)
- Any new page, view, or UI component in its IN scope
- Any change to an existing user-facing layout, interaction, or visual treatment

### PBIs that skip the Design Agent

- Pure backend PBIs (all scenarios tagged `@backend` only)
- Infrastructure PBIs with no user-visible surface
- Bug fixes that restore a previously approved design (the original spec is already the reference)
- **`minor` tier PBIs** — CSS/layout-only changes with no new components, no new interactions, and no new copy. The complexity tier is declared in the feature file's `# Complexity:` comment.

When skipping, the Design Agent notes: `"Design stage skipped — [reason: no frontend scope / minor tier / bug fix restoring prior design] in PBI-XXX."` and the Architecture Agent proceeds.

---

## What the Design Agent Receives

- The approved `.feature` file(s) for the PBI
- The current frontend codebase structure (to understand existing components, conventions, and design patterns already in use)
- Any existing Design Specifications from previous increments (to maintain visual consistency)
- The coding guidelines (`engineering/guidelines/coding-guidelines.md`) — specifically the frontend sections, to ensure the spec is implementable within the established component/hook/service model
- Any relevant accepted ADRs that constrain the frontend (e.g., ADR-009 Vite migration, ADR-010 API service layer)

The Design Agent does **not** receive implementation agent conversations, reasoning, or prior session context. It works from the artefacts only.

---

## What the Design Agent Produces

One **Design Specification** per PBI, saved to:

```
dev-flow/design/
└── PBI-XXX-<short-slug>-design.md
```

---

## Design Specification Structure

Every Design Specification uses the following format:

```
# Design Specification — PBI-XXX: [Feature Name]

**PBI:** PBI-XXX
**Design Agent output date:** YYYY-MM-DD
**Status:** Draft | Approved | Superseded

---

## 1. Feature Summary

[1–2 sentences: what the user can now do that they couldn't before, and how they experience it.]

---

## 2. Scope

**IN scope for this design:**
- [Visual surface or interaction covered by this spec]

**OUT of scope:**
- [Things not designed here — deferred, backend-only, or covered by a prior spec]

---

## 3. Pages and Routes Affected

| Route | Page/Component | New or Modified |
|---|---|---|
| /path | PageName | New / Modified |

---

## 4. Component Inventory

List every UI component needed for this PBI: new components to create, and existing components to modify.

| Component | Status | Location | Responsibility |
|---|---|---|---|
| ComponentName | New / Modified | `src/features/x/ComponentName.tsx` | [What it renders and why] |

---

## 5. Layout and Visual Structure

For each new page or significantly modified view, describe the layout using structured notation. Use ASCII wireframes for complex layouts; prose is acceptable for simple changes.

### [View or Page Name]

```
┌─────────────────────────────────────────┐
│  [Header / Navigation]                  │
├─────────────────────────────────────────┤
│  [Page Title]                           │
│                                         │
│  [Primary Content Area]                 │
│    [Element 1]                          │
│    [Element 2]                          │
│                                         │
│  [Secondary Content or Sidebar]         │
└─────────────────────────────────────────┘
```

**Sizing and spacing notes:**
- [Any grid, spacing, or breakpoint guidance]

**Responsive behaviour:**
- [How the layout adapts at smaller viewports, if applicable]

---

## 6. Interaction Specification

For each user interaction in the feature (clicks, form submissions, navigation, loading states), define what happens.

### [Interaction Name]

**Trigger:** [What the user does — clicks a button, submits a form, navigates to a route]
**Precondition:** [What state the UI must be in for this interaction to be available]
**Outcome:** [What the user sees after the interaction completes]

**States to design for:**

| State | Visual treatment |
|---|---|
| Default | [Normal appearance] |
| Loading | [Skeleton, spinner, disabled state — pick one and justify] |
| Error | [Error message placement and copy] |
| Empty | [What the user sees when there is no data] |
| Success | [Confirmation treatment, if applicable] |

---

## 7. Copy and Labels

All user-visible text that must appear exactly as written — button labels, headings, error messages, empty state copy, placeholder text. Where copy is flexible, note the constraint (e.g., "max 40 chars", "sentence case").

| Element | Copy | Notes |
|---|---|---|
| Button | "Submit" | Sentence case |
| Error message | "No results found for '{query}'" | Must include the query string |

---

## 8. Accessibility Notes

Minimum requirements the implementation must meet for this feature:

- Focus management: [Where focus lands after an interaction, if non-obvious]
- ARIA labels: [Any non-visual elements that need labels]
- Keyboard navigation: [Any interaction that must be keyboard-accessible]
- Colour contrast: [Any new colours introduced must meet WCAG AA]

---

## 9. Design Decisions and Rationale

Document any non-obvious design choice and the reasoning behind it. This section is the equivalent of an ADR for design — it lets the human review the "why" and challenge it before implementation.

| Decision | Alternatives considered | Rationale |
|---|---|---|
| [What was decided] | [What else was considered] | [Why this choice] |

---

## 10. Open Design Questions

Any aspect of the design that requires a product decision before the frontend engineer can implement it.

```
## Design Gap List — PBI-XXX

The following design decisions cannot be resolved without a product choice:

1. OPEN: [Question]
   → Affects: [Which component or interaction]
   → If unresolved, the implementation agent will need to make an assumption.

2. OPEN: ...
```

If there are no open questions, state: "No open design questions."

---

## 11. Scenario Traceability

Confirm that each `@frontend` and `@e2e` scenario in the `.feature` file is addressed by this spec.

| Scenario | Addressed by |
|---|---|
| "User sees search results" | Section 5 — Search Results View; Section 6 — Loading/Error states |
| "User navigates to item detail" | Section 3 — Routes; Section 6 — Navigation interaction |

If a scenario is not covered, flag it here rather than silently omitting it.
```

---

## Design Constraints

The Design Agent must operate within the following constraints:

### Visual consistency
- Respect the existing visual language of the application — colour palette, typography, spacing scale, and component styles already in use. A redesign must be explicitly requested by the human; the Design Agent does not initiate one.
- Reuse existing components wherever possible. Proposing a new component when an existing one can be modified adds unnecessary complexity.

### Implementation feasibility
- Designs must be implementable within the established component/hook/service architecture (ADR-010). A design that requires a component to fetch data directly is not a valid design spec — it must be restructured so a hook provides the data.
- Designs must not introduce new external dependencies (new CSS libraries, new icon sets, new animation libraries) without flagging this explicitly in the Open Design Questions section. Any new dependency requires an ADR.

### Scope discipline
- The Design Agent designs only what is in the PBI's IN scope. It does not design adjacent improvements, enhancements to other features, or speculative future states unless explicitly asked.
- If the Design Agent notices an adjacent UX issue while working, it surfaces it in a brief note rather than incorporating it into the spec: "Note: the existing search input has a related usability issue (no clear button) — this is out of scope for PBI-XXX but may be worth a future PBI."

---

## Human Checkpoint

Once the Design Specification is produced, the human reviews it. This is the **design approval checkpoint**.

**What you are approving:**
- Does the layout and interaction model match what you intended when you described the feature?
- Is the copy and labelling right?
- Are the design decisions and rationale ones you agree with?
- Are any open design questions ones you can answer now?

**What you are not being asked to assess:**
- Implementation correctness (that is the Review Agent's job)
- Technical feasibility (that is the Architecture Agent's job)
- Whether the tests cover the design (that is the Test Agent's job)

**To approve and proceed to architecture:**
> "Design approved, proceed to architecture."

**To request changes:**
> "On PBI-XXX: the search results should use a card layout, not a list. The empty state copy should mention the type filter specifically."

**To answer an open design question:**
> "On the gap list: use a spinner for loading states, not a skeleton. The error message should use the query string."

The Architecture Agent does not begin until the Design Specification is approved. If architecture begins without an approved design spec for a frontend PBI, the Independent Review Agent treats this as a Blocker.

---

## What the Design Agent Does Not Do

- It does not write CSS, SCSS, or any implementation code.
- It does not make product decisions. If a scenario is ambiguous, it surfaces a question rather than resolving it silently.
- It does not approve ADRs. That is the human's role.
- It does not modify `.feature` files or acceptance scenarios.
- It does not initiate a visual redesign of features outside the PBI's scope.
- It does not produce high-fidelity mockups (no external tools, no image files). All artefacts are text-based and committed alongside other dev-flow documents.

---

## Updating an Approved Design

If an approved Design Specification needs to change (e.g., the Architecture Agent identifies a constraint that makes a design element unimplementable, or the human requests a change mid-implementation), the Design Agent:

1. Updates the specification file with the change.
2. Updates the status field to `Draft`.
3. Notes the change and the reason in the Design Decisions section.
4. Resubmits for human approval.

Implementation does not continue until the revised spec is re-approved.
