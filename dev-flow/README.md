# Dev Flow

This folder defines the agentic development workflow for the product. It governs how product increments are broken down, implemented, tested, reviewed, and validated — with agents handling implementation and review, and a human in the loop only for major decisions.

## Structure

```
dev-flow/
├── README.md                        ← This file
├── product/
│   ├── acceptance-scenarios.md      ← Scenario format, conventions, and examples
│   └── (increment-specific .feature files live here per backlog item)
└── engineering/
    ├── guidelines/
    │   └── coding-guidelines.md     ← React + Java coding standards all agents must follow
    ├── architecture/
    │   └── (ADRs created per major decision)
    ├── testing/
    │   └── (test strategy and framework configuration)
    └── state/
        └── state-update-guidelines.md  ← Rules for keeping CLAUDE.md current state accurate
```

## Workflow Overview

### Feature track

```
Product Increment Statement
       │
       ▼
[Breakdown Agent] → Backlog items + User Stories
       │
       ▼
[Prioritization Agent] → Ordered backlog
       │
       ▼
[Acceptance Scenario Agent] → .feature files (Gherkin)
       │
       ▼
      👤 Human checkpoint: review scenarios
       │
       ▼
[Architecture Agent] → ADR per major decision
       │
       ▼
      👤 Human checkpoint: review architecture & flow
       │
       ▼
[Implementation Agents] ──────────────────────────────┐
  ├── Frontend (React)                                 │
  └── Backend (Java)                    [Security Agent] (inline)
       │
       ▼
[Independent Review Agent] → Review report
       │
       ▼
      👤 Human checkpoint: review report (major issues only)
       │
       ▼
[State Update Agent] → Updates CLAUDE.md (per completed PBI)
       │
       ▼
[Increment Validation Agent] → Acceptance report
       │
       ▼
      👤 Human checkpoint: confirm increment delivered intent
       │
       ▼
[State Update Agent] → Updates CLAUDE.md (per accepted increment)
```

### Bug track

```
Bug Report (symptom + severity)
       │
       ├─── Critical ──────────────────────────────────────────┐
       │                                                        │
       ▼                                                        ▼
[Breakdown Agent] → Bug PBI            [Breakdown Agent] → Minimal Bug PBI
       │            (normal)                    │               (fast-track)
       ▼                                        ▼
[Prioritization Agent]        [Acceptance Scenario Agent] → Regression scenario
  (severity determines                          │
   queue position)             👤 Verbal confirmation (no formal checkpoint)
       │                                        │
       ▼                                        ▼
[Acceptance Scenario Agent]   [Architecture Agent] only if fix requires design change
  → Regression scenario +              │
    correct-behaviour scenarios         └─ otherwise skip to ──┐
       │                                                        │
      👤 Human checkpoint: review scenarios                     │
       │                                                        │
       └──────────────────────────────┬─────────────────────────┘
                                      ▼
                         [Implementation Agents] + [Security Agent] (if security-related)
                                      │
                                      ▼
                         [Independent Review Agent]
                           (enforces regression test)
                                      │
                                      ▼
                         [State Update Agent] → Updates CLAUDE.md
```

## Human Checkpoints

You review three things — and only these three:

1. **Acceptance scenarios** — before engineering starts. Do these scenarios match your intent?
2. **Architecture decisions** — before implementation. Does the proposed approach and data flow make sense?
3. **Increment validation report** — after delivery. Did the product do what it was supposed to do?

The independent review agent escalates to you only if it finds something that constitutes a major architectural deviation or security risk — not for routine code quality issues.
