---
title: refine-spec
name: refine-spec
description: Deepen an existing spec toward a half-implementation — interface shapes, code examples, size estimates, vertical slices. Use when a spec covers a complex feature that needs more thinking before implementing, or the user asks to refine a spec.
---

# Refine Spec

Take an existing `./specs/<feature>.md` and think it further — a **half-implementation** on paper. Small features skip this entirely: spec → implement. Complex ones earn a refinement pass so implementation becomes execution, not discovery.

Everything lands in the same spec file, under a `## Refinement` section. No separate plan artifact.

## Process

1. **Spec in context?** If not, ask for it or point to `./specs/`.

2. **Explore deeply.** Read the actual code the feature will touch — not just structure. Find prior art: similar features, the conventions they follow (`CONVENTIONS.md`), the seams they test at.

3. **Shape the interfaces.** For each module built or modified: its interface as it will actually look — signatures, types, the calls between them. Short code examples where they encode a decision more precisely than prose (a type shape, a state machine, a schema) — decision-rich fragments, not working code.

4. **Estimate.** Per module: rough line-count delta, complexity (mechanical / moderate / tricky, with the tricky part named), and which existing abstractions are touched or need to change. Estimates are for spotting risk — a "tricky, ~400 lines, changes a shared abstraction" module deserves a prototype or a grilling before anyone implements it. Say so when you see one.

5. **Slice vertically.** Break the work into tracer-bullet slices — each cuts end-to-end and delivers something demoable. Prefer many thin over few thick. Any prefactoring comes first — "make the change easy, then make the easy change." Note `Blocked by:` per slice only when the graph branches; work the frontier.

   **Wide refactors are the exception to vertical slicing.** One mechanical change whose blast radius fans across the codebase can't land green as a slice — sequence it as **expand–contract**: expand (add the new form beside the old), migrate call sites in batches (each blocked by the expand), contract (delete the old form, blocked by every batch).

6. **Check with the user.** Present interfaces, risk estimates, and slices. Iterate until it feels right, then write the `## Refinement` section into the spec.

<refinement-template>

## Refinement

### Interfaces

Per module: the interface as it will look, with decision-rich snippets.

### Estimates

| Module | ~LOC | Complexity | Abstractions touched |
|--------|------|------------|----------------------|

### Slices

1. **<Title>** — end-to-end behavior delivered. (Blocked by: —)
   - [ ] acceptance criterion

</refinement-template>

Implementation happens slice by slice via `/implement` — the refinement's slices are its work list.
