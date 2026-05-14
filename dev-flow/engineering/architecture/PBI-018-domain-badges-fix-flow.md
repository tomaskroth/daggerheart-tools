# Flow Descriptor — PBI-018: Fix domain badges after class selection

**PBI:** PBI-018
**ADR:** None required — see architecture exemption note below
**Date:** 2026-05-14

---

## Architecture exemption

This bug fix requires no architecture checkpoint. The fix:
- Corrects existing behaviour in a single frontend utility function (`extractDomains` in `classContentParsers.ts`)
- Introduces no new components, patterns, or data model changes
- Does not change any API contract
- Follows the established pattern already present in the codebase (string parsing utilities in `utils/`)

Implementation proceeds directly after this note is acknowledged.

---

## 1. What this builds

Fixes `extractDomains()` in `frontend/src/features/character-sheet/utils/classContentParsers.ts` so that domain badges render correctly in `ClassHeader` after a class is selected.

**Root cause:** The function captures the raw HTML text after `</strong>` (e.g. `" Grace &amp; Codex"`), then splits on `"&"`. Since the HTML entity `&amp;` contains a literal `&`, the split produces `["Grace ", "amp; Codex"]` — the second domain becomes `"amp; Codex"` rather than `"Codex"`. The result is two malformed domain names, neither matching any valid badge value, so `domains.length > 0` may be true but the badge content is wrong. In practice the regex itself may also fail to match depending on the exact HTML structure of the content, causing the function to return `[]`.

**Fix:** Split on `"&amp;"` (the HTML entity as it appears in the raw HTML string) rather than `"&"`, then trim each part. This correctly splits `"Grace &amp; Codex"` into `["Grace", "Codex"]`.

---

## 2. Component map

| Component | Layer | Status | Change |
|---|---|---|---|
| `classContentParsers.ts` | Frontend — utils | Modified | Fix `extractDomains` split delimiter from `"&"` to `"&amp;"` |
| `ClassHeader.tsx` | Frontend — component | Unchanged | Already correct — renders domains returned by `extractDomains` |

---

## 3. Data flow

No change to data flow. `extractDomains` is a pure function called with the already-fetched class `content` string. The fix is entirely within that function.

Before fix:
```
content: "... <strong>• DOMAINS:</strong> Grace &amp; Codex ..."
extractDomains → split("&") → ["Grace ", "amp; Codex"] → wrong
```

After fix:
```
content: "... <strong>• DOMAINS:</strong> Grace &amp; Codex ..."
extractDomains → split("&amp;") → ["Grace", "Codex"] → correct
```

---

## 4. API contract

No change.

---

## 5. Security notes

`extractDomains` operates on backend-sanitised content (ADR-002). The fix changes only the split delimiter; it introduces no new parsing, no user input handling, and no DOM interaction. No security impact.

---

## 6. Consistency notes

Follows the established utility function pattern in `utils/classContentParsers.ts`. No new patterns introduced.
