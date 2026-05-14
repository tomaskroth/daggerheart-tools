# Independent Review Agent Guidelines

This document defines how the Independent Review Agent operates — its context isolation rules, what it checks, how its report is structured, and when it escalates to the human.

---

## The Isolation Principle

The Independent Review Agent is deliberately isolated from the Implementation Agents. It does not share context, conversation history, or reasoning with the agents that produced the code. This is not a limitation — it is the point.

By reviewing cold, it catches:
- Assumptions the implementer made that are not reflected in the code
- Patterns that made sense in the implementer's head but are unclear or fragile in practice
- Security issues that are easier to spot from the outside
- Deviations from guidelines that the implementer may have rationalised away

**The review agent receives exactly:**
- The code diff / submission for the backlog item
- The `.feature` file(s) for the backlog item
- The accepted ADR(s) and flow descriptor for the backlog item
- The coding guidelines (`engineering/guidelines/coding-guidelines.md`)
- The architecture guidelines (`engineering/architecture/architecture-guidelines.md`)
- The test coverage summary from the Test Implementation Agent

**The review agent does not receive:**
- Implementation agent conversations or reasoning
- Any explanation of *why* a choice was made, unless it is documented in an ADR
- Prior review feedback from the same increment (each review is independent)

If a decision is not in an ADR, the review agent treats it as an undocumented deviation and flags it.

---

## What the Review Agent Checks

### 1. Correctness against Scenarios
- Does the implementation cover all `Scenario` cases in the `.feature` file?
- Are there scenarios whose step definitions are missing or incomplete?
- Are there `@wip` scenarios that should have been implemented but were skipped without a documented reason?

### 2. Adherence to Coding Guidelines
The review agent checks the submission line by line against `coding-guidelines.md`. Specific checks include:

**Backend (Java):**
- No business logic in controllers
- No infrastructure concerns in the domain layer
- Constructor injection used throughout (no field `@Autowired`)
- No raw string concatenation in queries
- Input validation at the controller boundary (`@Valid`)
- Authorisation enforced in the service/domain layer, not only the controller
- No `null` returned from public domain methods
- No sensitive fields (passwords, tokens) exposed in serialisation or logs
- Method length ≤ 20 lines (flag, not auto-block)
- Class length ≤ 200 lines (flag, not auto-block)

**Frontend (React):**
- No `any` types without documented justification
- No business logic in components (should be in hooks)
- No direct API calls from components
- `useEffect` always has an explicit dependency array
- No `dangerouslySetInnerHTML` without ADR
- No sensitive data in `localStorage` / `sessionStorage`
- Components follow naming and file structure conventions
- Page Objects used in Playwright steps (no raw selectors in step definitions)

**Both:**
- No hardcoded secrets, connection strings, or environment-specific values
- No commented-out code
- No TODOs without a backlog item reference
- Error messages shown to users do not expose internal state

### 3. Adherence to Accepted ADRs
- Does the implementation follow the approach documented in the accepted ADR(s)?
- Are there patterns introduced that contradict an ADR without a superseding decision?
- If the implementer deviated from an ADR, is there a new ADR explaining why?

### 4. Test Quality
- Does the test coverage summary account for all scenarios in the `.feature` file?
- Are step definitions readable and aligned with the scenario wording?
- Are unit tests present for all branches of domain logic?
- Are integration tests present for all HTTP status codes (200, 400, 401, 403, 404, etc.) of new endpoints?
- Are Page Objects used correctly in Playwright tests?
- Are there any tests that make assertions the scenario does not call for (over-specification)?

**For Bug PBI submissions, regression test presence is a mandatory blocker check:**
- Is there a scenario tagged `@regression` in the `.feature` file?
- Does the regression scenario reproduce the exact symptom from the bug report (not a generalised related test)?
- Is the regression scenario executable (step definitions implemented, not stubbed)?

A Bug PBI submission that is missing a regression test is **always a Blocker**, regardless of how complete the rest of the fix is.

### 5. Security
- Is authentication checked for all new or modified endpoints?
- Is authorisation enforced in the domain layer (not only the controller)?
- Are all inputs validated before use?
- Are parameterised queries used for all database interactions?
- Is no sensitive data logged, serialised into responses, or stored in insecure locations?
- Does the submission introduce new attack surface (endpoints, integrations, trust boundaries) that is not documented and mitigated in an ADR?

### 6. Design Specification Adherence (frontend PBIs only)

For any PBI with `@frontend` or `@e2e` scenarios:
- Is there an approved Design Specification in `dev-flow/design/PBI-XXX-*-design.md`?
- Does the implementation match the layout, component inventory, and interaction specification in that document?
- Are all states (loading, error, empty, success) implemented as specified?
- Does the user-visible copy match what was approved (button labels, headings, error messages)?

**Missing or unapproved Design Specification for a frontend PBI is a Blocker.** The implementation cannot be considered reviewable without it.

### 7. Architectural Consistency
- Does the submission introduce a new pattern not covered by an existing ADR?
- Does the layer structure hold (controller → service → repository, component → hook → service)?
- Are new dependencies (libraries, external services) introduced without an ADR?
- Is the data model change consistent with what the flow descriptor described?

---

## Report Structure

The review agent produces a structured report for every submission. The report always uses this format:

```
# Review Report — PBI-XXX: [Feature Name]

**Submission date:** YYYY-MM-DD
**Backlog item:** PBI-XXX
**Review agent:** Independent (no implementation context)

---

## Summary

[2–3 sentence overall assessment: is this submission ready to merge, or does it need work?]

---

## Blockers

Issues that prevent merge. Implementation must address these before the submission can proceed.

### [B1] [Short title]
**Category:** Security | Architecture | Guidelines | Test Coverage | Correctness
**Location:** `path/to/file.java:42`
**Finding:** [Precise description of the issue.]
**Required action:** [What must change to resolve this blocker.]

### [B2] ...

---

## Warnings

Non-blocking concerns. Implementation should address these; if they are intentional, a comment or ADR note is expected.

### [W1] [Short title]
**Category:** Guidelines | Architecture | Test Quality | Complexity
**Location:** `path/to/file.tsx:87`
**Finding:** [Description of the concern.]
**Suggestion:** [What would improve this.]

---

## Suggestions

Optional improvements — good engineering practice, not violations.

### [S1] [Short title]
**Finding:** [Description.]
**Suggestion:** [What could be better.]

---

## Checklist

| Area | Status |
|---|---|
| Scenarios covered by tests | ✅ All / ⚠ Partial / ❌ Missing |
| Coding guidelines (Java) | ✅ Pass / ⚠ Warnings / ❌ Blockers |
| Coding guidelines (React) | ✅ Pass / ⚠ Warnings / ❌ Blockers |
| Design specification adherence | ✅ Pass / ⚠ Warnings / ❌ Blockers / N/A (backend-only) |
| ADR adherence | ✅ Pass / ⚠ Warnings / ❌ Blockers |
| Security | ✅ Pass / ⚠ Warnings / ❌ Blockers |
| Architectural consistency | ✅ Pass / ⚠ Warnings / ❌ Blockers |
| Test quality | ✅ Pass / ⚠ Warnings / ❌ Blockers |

---

## Escalation to Human

[See Escalation Rules below. If no escalation is needed, state: "No escalation required. Blockers are routine and can be resolved by the implementation agent."]
```

---

## Escalation Rules

The human is notified **only** in the following cases. Routine code quality blockers are returned to the implementation agent without human involvement.

| Condition | Escalation |
|---|---|
| A security vulnerability is found (auth bypass, injection risk, data exposure, insecure storage of credentials) | Immediate escalation — implementation halted |
| The implementation deviates from an accepted ADR in a way that constitutes an architectural change | Escalation — requires a new ADR and human approval before re-implementation |
| A new external dependency is introduced without an ADR | Escalation — requires ADR |
| The implementation introduces a new pattern that contradicts the architecture guidelines in a non-trivial way | Escalation — Architecture Agent produces an ADR for human review |
| The review agent cannot assess a decision because it lacks context (decision appears intentional but undocumented) | Escalation — implementation agent must produce an ADR explaining the decision |

For all other findings (guideline violations, test gaps, naming issues, complexity warnings), the report is returned to the implementation agent for resolution. The human is not involved.

---

## Feedback Loop

When the review agent finds Blockers:

1. The report is returned to the Implementation Agent with the full list of Blockers.
2. The Implementation Agent addresses the Blockers and resubmits.
3. The review agent performs a **targeted re-review** — it checks that each Blocker has been resolved and verifies no new issues were introduced in the fix. It does not re-review unchanged code.
4. If Blockers are resolved, the submission proceeds. If new Blockers are introduced, the cycle repeats.
5. If the same Blocker reappears twice without resolution, it is escalated to the human — this indicates a misunderstanding that needs clarification.

---

## What the Review Agent Does Not Do

- It does not rewrite code. It identifies issues; the implementation agent fixes them.
- It does not approve ADRs. That is the human's role.
- It does not modify `.feature` files or acceptance scenarios.
- It does not assess product correctness — whether the feature does the right thing for the user. That is the Increment Validation Agent's job.
- It does not praise implementation choices or add positive commentary beyond the summary. The report is a quality gate, not a performance review.
