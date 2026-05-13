# Architecture Guidelines

This document defines how the Architecture Agent approaches solution design for each backlog item. It governs when an ADR is required, what constitutes a major decision, how data flow is documented, and what must be produced before implementation begins.

---

## Responsibilities of the Architecture Agent

For each backlog item, the Architecture Agent must:

1. Analyse the acceptance scenarios to understand the full behavioural scope of what needs to be built.
2. Determine whether the item introduces any major decisions (see below).
3. Produce an ADR for every major decision, using `ADR-template.md`.
4. Produce a **flow descriptor** for the backlog item — even when no major decision is triggered — so the human can review what will be built before implementation starts.
5. Identify security implications and surface them in both the ADR and the flow descriptor.
6. Confirm that the proposed design is consistent with existing ADRs and the coding guidelines.

The Architecture Agent does **not** write implementation code. It produces decision documents and flow descriptors only.

---

## What Triggers an ADR

An ADR is required whenever a decision:

- Introduces a new external dependency (library, service, API, infrastructure component)
- Changes or extends the data model (new tables, schema changes, new relationships)
- Introduces a new API endpoint or changes an existing one's contract
- Changes authentication or authorisation behaviour
- Establishes a new pattern not already present in the codebase (state management approach, caching strategy, background job mechanism, etc.)
- Involves a meaningful trade-off between two or more reasonable approaches
- Has consequences that would be difficult or costly to reverse

When in doubt, write an ADR. It is better to over-document than to implement a consequential choice silently.

---

## What Does Not Require an ADR

Decisions that follow an already-accepted pattern and introduce no new trade-offs do not need an ADR. Examples:

- Adding a new field to an existing entity following the established model pattern
- Adding a new endpoint that follows the established controller/service/repository pattern
- Adding a new React component following the established feature structure
- Introducing a new acceptance test

In these cases, a brief note in the flow descriptor confirming "this follows the established pattern from ADR-XXX" is sufficient.

---

## Bug Fixes and the Architecture Checkpoint

**Most bug fixes do not require an architecture checkpoint.** If the fix:
- Corrects existing behaviour without introducing new components, patterns, or data model changes
- Follows an established pattern documented in an accepted ADR
- Does not change an API contract

...then the Architecture Agent confirms the exemption in a one-paragraph note and implementation proceeds immediately. No flow descriptor is produced and no human review is triggered.

**An ADR and architecture checkpoint are still required for bug fixes that:**
- Require a new or changed data model
- Change an API contract (even to fix a bug)
- Introduce a new external dependency as part of the fix
- Require a new pattern not present in the codebase
- Reveal a structural flaw whose correct fix constitutes an architectural change

When the Architecture Agent determines an architecture checkpoint is required for a bug fix, it notes this explicitly: "This bug fix requires architecture review because: [reason]."

---

## The Flow Descriptor

Every backlog item gets a flow descriptor — a short, human-readable document that describes what will be built and how the pieces fit together. It is produced alongside or instead of an ADR for items that don't trigger a major decision.

The flow descriptor must include:

**1. What this builds**
A plain-language summary of the feature or change, referencing the backlog item and its acceptance scenarios.

**2. Component map**
Which components (frontend, backend services, infrastructure) are involved, and whether they are new or modified.

**3. Data flow**
How data moves through the system for the primary use case — from user action to persistence and back. A Mermaid diagram is preferred; a numbered sequence list is acceptable.

**4. API contract**
For any new or changed endpoints: method, path, request shape, response shape, HTTP status codes, and auth requirement.

**5. Security notes**
At minimum: who is authorised to perform the action, where that check is enforced, and whether sensitive data is involved.

**6. Consistency notes**
Confirmation that the design follows existing patterns, or a flag if it deviates and why.

### Flow Descriptor File Naming

```
dev-flow/engineering/architecture/
└── PBI-XXX-<short-slug>-flow.md
```

---

## ADR Numbering and Filing

ADRs are numbered sequentially, starting from `ADR-001`. The Architecture Agent assigns the next available number.

```
dev-flow/engineering/architecture/
├── ADR-template.md
├── ADR-001-<short-slug>.md
├── ADR-002-<short-slug>.md
└── PBI-XXX-<short-slug>-flow.md
```

Once an ADR is marked `Accepted` (human has approved), it becomes a binding constraint for all future architecture and implementation work. The Implementation and Review Agents treat accepted ADRs as hard requirements.

---

## Architectural Principles (Hard Constraints)

These are not preferences — they are constraints the Architecture Agent must design within. Deviating from them requires an explicit ADR with human approval.

### Backend (Java)

**Layered architecture with enforced direction:**
```
HTTP / API Layer (Controllers)
        ↓ calls
Domain Layer (Services, Domain Models, Use Cases)
        ↓ calls (via interface)
Infrastructure Layer (Repositories, External Adapters)
```
Dependencies only point downward. The domain layer defines interfaces; infrastructure implements them. Controllers know nothing about persistence. The domain knows nothing about HTTP.

**One service per domain concept.** Services are not catch-all utilities. Each service encapsulates a bounded, named piece of business behaviour.

**Repository abstraction.** The domain never calls JPA/Hibernate directly. It calls repository interfaces. The infrastructure module provides implementations.

### Frontend (React)

**Feature-first structure.** Code is organised by feature, not by technical layer. Each feature is a self-contained module with its own components, hooks, and types, exposing a public API via `index.ts`.

**Dumb components, smart hooks.** Components render; hooks manage logic and state. A component that fetches data, transforms it, and renders it is doing too much.

**Server state is not global state.** Data that lives on the server (user profile, product list, etc.) is fetched and cached via a data-fetching library (React Query or SWR). It is not duplicated into a global store.

---

## Security Architecture Principles

The Architecture Agent applies these at design time — before implementation:

- **Authorisation is enforced in the domain layer**, not the controller. Controllers parse and route; they do not make security decisions.
- **Trust boundaries are explicit.** Every point where data crosses a trust boundary (user input, external service response, inter-service call) must be identified and its validation strategy documented.
- **Least privilege.** API endpoints and database access are scoped to what the operation requires. Broad permissions are flagged.
- **No security through obscurity.** Security must not depend on endpoints being unknown, tokens being hard to guess, or IDs being non-sequential.
- **PII and sensitive data is identified at design time.** If an entity contains sensitive fields, the flow descriptor must note where that data is stored, who can access it, and how it is protected in transit and at rest.

---

## Human Review: What You Are Approving

When you review an ADR or flow descriptor, you are confirming:

- The problem is understood correctly
- The proposed approach makes sense for the product
- The trade-offs are acceptable
- The data flow is logical and complete
- The security posture is appropriate
- You are comfortable with implementation proceeding on this basis

You are **not** being asked to review code, verify implementation correctness, or approve specific technical choices below the level of component design and data flow.

If you approve an ADR or flow descriptor, implementation proceeds. If you reject or request revision, the Architecture Agent revises and resubmits.
